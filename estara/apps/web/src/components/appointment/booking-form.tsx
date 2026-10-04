"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/locale-provider";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";

interface DaySlots {
  date: string;
  slots: { start: string; end: string }[];
}

export function BookingForm({
  agentId,
  propertyId,
}: {
  agentId: string;
  propertyId?: string;
}) {
  const { t, locale } = useLocale();
  const [availability, setAvailability] = useState<DaySlots[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ clientName: "", clientEmail: "", clientPhone: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    api.appointments
      .availability(agentId)
      .then((res) => setAvailability(res as DaySlots[]))
      .catch(() => setAvailability([]));
  }, [agentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setStatus("submitting");
    setErrorMessage(null);
    try {
      await api.appointments.create({
        agentId,
        propertyId,
        startTime: selectedSlot,
        ...form,
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMessage((err as Error).message);
    }
  }

  if (status === "done") {
    return (
      <div className="mica-surface rounded-win p-5 text-sm">
        ✅ {t("appointments.confirm")} — {selectedSlot ? formatDateTime(selectedSlot, locale) : ""}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mica-surface space-y-4 rounded-win p-5">
      <div className="flex flex-wrap gap-2">
        {availability.flatMap((day) =>
          day.slots.slice(0, 6).map((slot) => (
            <button
              type="button"
              key={slot.start}
              onClick={() => setSelectedSlot(slot.start)}
              className={`rounded-win border px-3 py-1.5 text-xs transition ${
                selectedSlot === slot.start
                  ? "accent-bg border-transparent"
                  : "border-border hover:bg-accent/10"
              }`}
            >
              {formatDateTime(slot.start, locale)}
            </button>
          )),
        )}
        {availability.length === 0 && (
          <p className="text-sm text-muted">{t("appointments.closedToday")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          required
          placeholder={t("appointments.yourName")}
          value={form.clientName}
          onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
          className="rounded-win border border-border bg-transparent px-3 py-2 text-sm"
        />
        <input
          required
          type="email"
          placeholder={t("appointments.yourEmail")}
          value={form.clientEmail}
          onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
          className="rounded-win border border-border bg-transparent px-3 py-2 text-sm"
        />
        <input
          required
          placeholder={t("appointments.yourPhone")}
          value={form.clientPhone}
          onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
          className="rounded-win border border-border bg-transparent px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          placeholder={t("appointments.notes")}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="rounded-win border border-border bg-transparent px-3 py-2 text-sm sm:col-span-2"
          rows={2}
        />
      </div>

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      <button
        type="submit"
        disabled={!selectedSlot || status === "submitting"}
        className="accent-bg rounded-win px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {status === "submitting" ? "..." : t("appointments.confirm")}
      </button>
    </form>
  );
}
