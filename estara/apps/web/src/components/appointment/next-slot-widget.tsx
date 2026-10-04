"use client";

import { useEffect, useState } from "react";
import { Clock, TimerReset } from "lucide-react";
import { api } from "@/lib/api-client";
import { useLocale } from "@/i18n/locale-provider";
import { formatDateTime } from "@/lib/utils";

interface NextSlotState {
  now: string;
  timezone: string;
  nextSlot: { start: string; end: string } | null;
  minutesUntilNextSlot: number | null;
  humanReadable: string | null;
}

/**
 * Shows the agent's current local time and a live countdown to the next
 * bookable slot. The countdown ticks client-side every second between
 * server refreshes so it feels real-time without hammering the API.
 */
export function NextSlotWidget({ agentId }: { agentId: string }) {
  const { t, locale } = useLocale();
  const [data, setData] = useState<NextSlotState | null>(null);
  const [liveNow, setLiveNow] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSlot() {
      try {
        const res = await api.appointments.nextSlot(agentId);
        if (!cancelled) {
          setData(res);
          setLiveNow(new Date(res.now));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    fetchSlot();
    const refresh = setInterval(fetchSlot, 60_000); // resync with server every minute
    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, [agentId]);

  // Local ticking clock between server refreshes.
  useEffect(() => {
    const tick = setInterval(() => {
      setLiveNow((prev) => (prev ? new Date(prev.getTime() + 1000) : prev));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  if (error) {
    return (
      <div className="mica-surface rounded-win p-4 text-sm text-muted">
        Could not reach the API ({error}).
      </div>
    );
  }

  if (!data || !liveNow) {
    return <div className="mica-surface h-24 animate-pulse rounded-win" />;
  }

  const secondsUntil = data.nextSlot
    ? Math.max(0, Math.round((new Date(data.nextSlot.start).getTime() - liveNow.getTime()) / 1000))
    : null;

  const countdown =
    secondsUntil !== null
      ? formatCountdown(secondsUntil)
      : t("appointments.closedToday");

  return (
    <div className="mica-surface grid grid-cols-1 gap-4 rounded-win p-4 sm:grid-cols-2">
      <div className="flex items-start gap-3">
        <Clock size={20} className="mt-0.5 text-accent" />
        <div>
          <p className="text-xs text-muted">{t("appointments.currentTime")}</p>
          <p className="text-lg font-semibold tabular-nums">
            {liveNow.toLocaleTimeString(locale === "fa" ? "fa-IR" : locale === "zh" ? "zh-CN" : "en-US")}
          </p>
          <p className="text-xs text-muted">{data.timezone}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <TimerReset size={20} className="mt-0.5 text-accent" />
        <div>
          <p className="text-xs text-muted">{t("appointments.timeUntilNext")}</p>
          <p className="text-lg font-semibold tabular-nums">{countdown}</p>
          {data.nextSlot && (
            <p className="text-xs text-muted">
              {t("appointments.nextSlot")}: {formatDateTime(data.nextSlot.start, locale)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatCountdown(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (days > 0 || hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}
