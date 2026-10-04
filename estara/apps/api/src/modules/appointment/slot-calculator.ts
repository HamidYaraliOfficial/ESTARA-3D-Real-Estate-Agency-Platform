import { BusinessHours } from "@prisma/client";

export interface Slot {
  start: Date;
  end: Date;
}

interface ExistingBooking {
  startTime: Date;
  endTime: Date;
}

function parseTimeOnDate(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Pure, framework-agnostic slot calculator.
 *
 * Given one day's BusinessHours record, the calendar date it applies to,
 * and the appointments already booked that day, this returns every free
 * slot of `slotDurationMinutes` between opening and closing time, with the
 * lunch break (if any) and any conflicting bookings removed.
 */
export function computeSlotsForDay(
  day: Date,
  hours: Pick<
    BusinessHours,
    "isClosed" | "openTime" | "closeTime" | "breakStart" | "breakEnd" | "slotDurationMinutes"
  >,
  existingBookings: ExistingBooking[],
): Slot[] {
  if (hours.isClosed) return [];

  const open = parseTimeOnDate(day, hours.openTime);
  const close = parseTimeOnDate(day, hours.closeTime);
  const durationMs = hours.slotDurationMinutes * 60 * 1000;

  const breakStart = hours.breakStart ? parseTimeOnDate(day, hours.breakStart) : null;
  const breakEnd = hours.breakEnd ? parseTimeOnDate(day, hours.breakEnd) : null;

  const slots: Slot[] = [];
  let cursor = new Date(open);

  while (cursor.getTime() + durationMs <= close.getTime()) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor.getTime() + durationMs);

    const duringBreak =
      breakStart && breakEnd && overlaps(slotStart, slotEnd, breakStart, breakEnd);

    const conflicting = existingBookings.some((b) =>
      overlaps(slotStart, slotEnd, b.startTime, b.endTime),
    );

    if (!duringBreak && !conflicting) {
      slots.push({ start: slotStart, end: slotEnd });
    }

    cursor = new Date(cursor.getTime() + durationMs);
  }

  return slots;
}

export function formatMinutesUntil(minutes: number): string {
  if (minutes <= 0) return "now";
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(days + "d");
  if (hours > 0) parts.push(hours + "h");
  if (mins > 0 || parts.length === 0) parts.push(mins + "m");
  return parts.join(" ");
}
