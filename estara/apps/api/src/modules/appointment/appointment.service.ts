import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BusinessHoursService } from "../business-hours/business-hours.service";
import { CreateAppointmentDto } from "./dto";
import { computeSlotsForDay, formatMinutesUntil, Slot } from "./slot-calculator";

const MAX_LOOKAHEAD_DAYS = 30;

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private businessHoursService: BusinessHoursService,
  ) {}

  /**
   * Returns every free slot for `agentId` between `from` and `to`
   * (defaults to "now" through +14 days), taking the agent's configured
   * business hours and already-booked appointments into account.
   */
  async getAvailability(agentId: string, from?: Date, to?: Date) {
    const rangeStart = from ?? new Date();
    const rangeEnd = to ?? addDays(rangeStart, 14);

    const weekSchedule = await this.businessHoursService.getForAgent(agentId);
    const byDayOfWeek = new Map(weekSchedule.map((h) => [h.dayOfWeek, h]));

    const days: { date: string; slots: Slot[] }[] = [];
    for (
      let cursor = startOfDay(rangeStart);
      cursor <= rangeEnd;
      cursor = addDays(cursor, 1)
    ) {
      const hours = byDayOfWeek.get(cursor.getDay());
      if (!hours) continue;

      const dayStart = startOfDay(cursor);
      const dayEnd = endOfDay(cursor);

      const bookings = await this.prisma.appointment.findMany({
        where: {
          agentId,
          status: { notIn: ["CANCELLED"] },
          startTime: { gte: dayStart, lte: dayEnd },
        },
        select: { startTime: true, endTime: true },
      });

      const slots = computeSlotsForDay(cursor, hours, bookings).filter(
        (s) => s.start >= rangeStart,
      );

      days.push({ date: dayStart.toISOString().slice(0, 10), slots });
    }

    return days;
  }

  /**
   * The headline feature: given "now", tells the caller the agent's
   * current local time, whether they are inside business hours, and
   * exactly how long until the next bookable slot opens up.
   */
  async getNextAvailableSlot(agentId: string) {
    const now = new Date();
    const weekSchedule = await this.businessHoursService.getForAgent(agentId);
    const timezone = weekSchedule[0]?.timezone ?? process.env.DEFAULT_TIMEZONE ?? "Asia/Baku";

    const availability = await this.getAvailability(
      agentId,
      now,
      addDays(now, MAX_LOOKAHEAD_DAYS),
    );

    for (const day of availability) {
      for (const slot of day.slots) {
        if (slot.start >= now) {
          const minutesUntilNextSlot = Math.round(
            (slot.start.getTime() - now.getTime()) / 60000,
          );
          return {
            now: now.toISOString(),
            timezone,
            nextSlot: { start: slot.start.toISOString(), end: slot.end.toISOString() },
            minutesUntilNextSlot,
            humanReadable: formatMinutesUntil(minutesUntilNextSlot),
          };
        }
      }
    }

    return {
      now: now.toISOString(),
      timezone,
      nextSlot: null,
      minutesUntilNextSlot: null,
      humanReadable: null,
    };
  }

  async create(dto: CreateAppointmentDto) {
    const start = new Date(dto.startTime);
    const weekSchedule = await this.businessHoursService.getForAgent(dto.agentId);
    const hours = weekSchedule.find((h) => h.dayOfWeek === start.getDay());

    if (!hours || hours.isClosed) {
      throw new ConflictException("Agent is closed on the selected day");
    }

    const end = new Date(start.getTime() + hours.slotDurationMinutes * 60000);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        agentId: dto.agentId,
        status: { notIn: ["CANCELLED"] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflict) {
      throw new ConflictException("This time slot was just taken — please pick another one");
    }

    return this.prisma.appointment.create({
      data: {
        agentId: dto.agentId,
        propertyId: dto.propertyId,
        clientName: dto.clientName,
        clientEmail: dto.clientEmail,
        clientPhone: dto.clientPhone,
        startTime: start,
        endTime: end,
        notes: dto.notes,
      },
    });
  }

  confirm(id: string) {
    return this.prisma.appointment.update({ where: { id }, data: { status: "CONFIRMED" } });
  }

  cancel(id: string) {
    return this.prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  }

  complete(id: string) {
    return this.prisma.appointment.update({ where: { id }, data: { status: "COMPLETED" } });
  }

  async reschedule(id: string, newStartTime: string) {
    const appointment = await this.prisma.appointment.findUniqueOrThrow({ where: { id } });
    const durationMs = appointment.endTime.getTime() - appointment.startTime.getTime();
    const start = new Date(newStartTime);
    const end = new Date(start.getTime() + durationMs);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        id: { not: id },
        agentId: appointment.agentId,
        status: { notIn: ["CANCELLED"] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflict) throw new ConflictException("New time conflicts with another appointment");

    return this.prisma.appointment.update({
      where: { id },
      data: { startTime: start, endTime: end, status: "RESCHEDULED" },
    });
  }
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}
function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}
