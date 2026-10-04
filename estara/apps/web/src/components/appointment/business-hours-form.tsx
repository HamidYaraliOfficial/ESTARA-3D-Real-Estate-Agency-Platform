"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useLocale } from "@/i18n/locale-provider";
import { BusinessHoursDay } from "@/types";
import { api } from "@/lib/api-client";

const DEFAULT_TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Baku";

function defaultWeek(): BusinessHoursDay[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: dayOfWeek === 5,
    openTime: "09:00",
    closeTime: "18:00",
    breakStart: null,
    breakEnd: null,
    slotDurationMinutes: 30,
    timezone: DEFAULT_TIMEZONE,
  }));
}

/**
 * Lets the agent/admin type in their own opening hours, break, and slot
 * length for every day of the week. This is the data source the
 * NextSlotWidget and booking flow read from — nothing here is hard-coded.
 */
export function BusinessHoursForm({
  agentId,
  accessToken,
}: {
  agentId: string;
  accessToken?: string;
}) {
  const { t } = useLocale();
  const [days, setDays] = useState<BusinessHoursDay[]>(defaultWeek());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    api.businessHours
      .get(agentId)
      .then((res) => setDays(res as BusinessHoursDay[]))
      .catch(() => {
        /* fall back to the sensible defaults already in state */
      });
  }, [agentId]);

  function updateDay(dayOfWeek: number, patch: Partial<BusinessHoursDay>) {
    setDays((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)),
    );
  }

  async function handleSave() {
    if (!accessToken) return;
    setStatus("saving");
    try {
      await api.businessHours.set(agentId, days, accessToken);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mica-surface space-y-4 rounded-win p-5">
      <h3 className="text-sm font-semibold">{t("appointments.businessHours")}</h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-start text-xs text-muted">
              <th className="py-2 text-start">{t("appointments.day")}</th>
              <th className="text-start">{t("appointments.open")}</th>
              <th className="text-start">{t("appointments.close")}</th>
              <th className="text-start">{t("appointments.breakStart")}</th>
              <th className="text-start">{t("appointments.breakEnd")}</th>
              <th className="text-start">{t("appointments.slotDuration")}</th>
              <th className="text-start">{t("appointments.closed")}</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.dayOfWeek} className="border-t border-border">
                <td className="py-2 pe-3 font-medium">
                  {t(`appointments.days.${day.dayOfWeek}`)}
                </td>
                <td className="pe-3">
                  <input
                    type="time"
                    value={day.openTime}
                    disabled={day.isClosed}
                    onChange={(e) => updateDay(day.dayOfWeek, { openTime: e.target.value })}
                    className="w-28 rounded-win border border-border bg-transparent px-2 py-1 disabled:opacity-40"
                  />
                </td>
                <td className="pe-3">
                  <input
                    type="time"
                    value={day.closeTime}
                    disabled={day.isClosed}
                    onChange={(e) => updateDay(day.dayOfWeek, { closeTime: e.target.value })}
                    className="w-28 rounded-win border border-border bg-transparent px-2 py-1 disabled:opacity-40"
                  />
                </td>
                <td className="pe-3">
                  <input
                    type="time"
                    value={day.breakStart ?? ""}
                    disabled={day.isClosed}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, { breakStart: e.target.value || null })
                    }
                    className="w-28 rounded-win border border-border bg-transparent px-2 py-1 disabled:opacity-40"
                  />
                </td>
                <td className="pe-3">
                  <input
                    type="time"
                    value={day.breakEnd ?? ""}
                    disabled={day.isClosed}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, { breakEnd: e.target.value || null })
                    }
                    className="w-28 rounded-win border border-border bg-transparent px-2 py-1 disabled:opacity-40"
                  />
                </td>
                <td className="pe-3">
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    value={day.slotDurationMinutes}
                    disabled={day.isClosed}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, {
                        slotDurationMinutes: Number(e.target.value),
                      })
                    }
                    className="w-20 rounded-win border border-border bg-transparent px-2 py-1 disabled:opacity-40"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={day.isClosed}
                    onChange={(e) => updateDay(day.dayOfWeek, { isClosed: e.target.checked })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSave}
        disabled={status === "saving"}
        className="accent-bg flex items-center gap-2 rounded-win px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        <Save size={16} />
        {status === "saving"
          ? "..."
          : status === "saved"
            ? "✓"
            : t("appointments.saveHours")}
      </button>
    </div>
  );
}
