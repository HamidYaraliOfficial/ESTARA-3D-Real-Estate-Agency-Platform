import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SetBusinessHoursDto } from "./dto";

@Injectable()
export class BusinessHoursService {
  constructor(private prisma: PrismaService) {}

  async getForAgent(agentId: string) {
    const hours = await this.prisma.businessHours.findMany({
      where: { agentId },
      orderBy: { dayOfWeek: "asc" },
    });
    if (hours.length > 0) return hours;
    return this.defaultSchedule(agentId);
  }

  /** Sat–Thu 09:00–18:00, Friday closed — a sane starting point, fully editable. */
  private defaultSchedule(agentId: string) {
    return Array.from({ length: 7 }, (_, dayOfWeek) => ({
      id: `default-${dayOfWeek}`,
      agentId,
      dayOfWeek,
      isClosed: dayOfWeek === 5,
      openTime: "09:00",
      closeTime: "18:00",
      breakStart: null,
      breakEnd: null,
      slotDurationMinutes: 30,
      timezone: process.env.DEFAULT_TIMEZONE ?? "Asia/Baku",
    }));
  }

  /** User submits the whole week at once; we upsert each day individually. */
  async setForAgent(agentId: string, dto: SetBusinessHoursDto) {
    const results = [];
    for (const day of dto.days) {
      const saved = await this.prisma.businessHours.upsert({
        where: { agentId_dayOfWeek: { agentId, dayOfWeek: day.dayOfWeek } },
        update: {
          isClosed: day.isClosed ?? false,
          openTime: day.openTime,
          closeTime: day.closeTime,
          breakStart: day.breakStart ?? null,
          breakEnd: day.breakEnd ?? null,
          slotDurationMinutes: day.slotDurationMinutes ?? 30,
          timezone: day.timezone ?? process.env.DEFAULT_TIMEZONE ?? "Asia/Baku",
        },
        create: {
          agentId,
          dayOfWeek: day.dayOfWeek,
          isClosed: day.isClosed ?? false,
          openTime: day.openTime,
          closeTime: day.closeTime,
          breakStart: day.breakStart ?? null,
          breakEnd: day.breakEnd ?? null,
          slotDurationMinutes: day.slotDurationMinutes ?? 30,
          timezone: day.timezone ?? process.env.DEFAULT_TIMEZONE ?? "Asia/Baku",
        },
      });
      results.push(saved);
    }
    return results.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }
}
