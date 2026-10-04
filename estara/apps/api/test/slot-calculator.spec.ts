import { computeSlotsForDay, formatMinutesUntil } from "../src/modules/appointment/slot-calculator";

const baseHours = {
  isClosed: false,
  openTime: "09:00",
  closeTime: "12:00",
  breakStart: null as string | null,
  breakEnd: null as string | null,
  slotDurationMinutes: 30,
};

describe("computeSlotsForDay", () => {
  const day = new Date("2026-09-24T00:00:00");

  it("generates evenly spaced slots between open and close", () => {
    const slots = computeSlotsForDay(day, baseHours, []);
    expect(slots).toHaveLength(6); // 09:00 -> 12:00 in 30-minute steps
    expect(slots[0].start.getHours()).toBe(9);
    expect(slots[0].start.getMinutes()).toBe(0);
    expect(slots[slots.length - 1].end.getHours()).toBe(12);
  });

  it("returns no slots when the day is marked closed", () => {
    const slots = computeSlotsForDay(day, { ...baseHours, isClosed: true }, []);
    expect(slots).toHaveLength(0);
  });

  it("removes slots that fall inside the lunch break", () => {
    const slots = computeSlotsForDay(
      day,
      { ...baseHours, breakStart: "10:00", breakEnd: "10:30" },
      [],
    );
    const hasBreakSlot = slots.some((s) => s.start.getHours() === 10 && s.start.getMinutes() === 0);
    expect(hasBreakSlot).toBe(false);
    expect(slots).toHaveLength(5);
  });

  it("removes slots that conflict with an existing booking", () => {
    const bookingStart = new Date(day);
    bookingStart.setHours(9, 30, 0, 0);
    const bookingEnd = new Date(day);
    bookingEnd.setHours(10, 0, 0, 0);

    const slots = computeSlotsForDay(day, baseHours, [
      { startTime: bookingStart, endTime: bookingEnd },
    ]);

    const conflictSlot = slots.find(
      (s) => s.start.getHours() === 9 && s.start.getMinutes() === 30,
    );
    expect(conflictSlot).toBeUndefined();
    expect(slots).toHaveLength(5);
  });
});

describe("formatMinutesUntil", () => {
  it("formats sub-hour durations", () => {
    expect(formatMinutesUntil(15)).toBe("15m");
  });

  it("formats hour + minute durations", () => {
    expect(formatMinutesUntil(90)).toBe("1h 30m");
  });

  it("formats multi-day durations", () => {
    expect(formatMinutesUntil(60 * 24 * 2 + 45)).toBe("2d 45m");
  });

  it("treats zero or negative as now", () => {
    expect(formatMinutesUntil(0)).toBe("now");
    expect(formatMinutesUntil(-5)).toBe("now");
  });
});
