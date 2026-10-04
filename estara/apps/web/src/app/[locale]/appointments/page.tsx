"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/locale-provider";
import { api } from "@/lib/api-client";
import { NextSlotWidget } from "@/components/appointment/next-slot-widget";
import { BookingForm } from "@/components/appointment/booking-form";
import { BusinessHoursForm } from "@/components/appointment/business-hours-form";

interface AgentOption {
  id: string;
  fullName: string;
}

export default function AppointmentsPage() {
  const { t } = useLocale();
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showHoursEditor, setShowHoursEditor] = useState(false);

  useEffect(() => {
    api.agents
      .list()
      .then((res) => {
        setAgents(res);
        if (res.length > 0) setSelectedAgent(res[0].id);
      })
      .catch(() => setAgents([]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">{t("appointments.title")}</h1>
        <p className="text-muted">{t("appointments.subtitle")}</p>
      </div>

      {agents.length > 0 && (
        <select
          value={selectedAgent ?? ""}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="rounded-win border border-border bg-transparent px-3 py-2 text-sm"
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.fullName}
            </option>
          ))}
        </select>
      )}

      {selectedAgent && (
        <>
          <NextSlotWidget agentId={selectedAgent} />
          <BookingForm agentId={selectedAgent} />

          <button
            onClick={() => setShowHoursEditor((v) => !v)}
            className="text-sm text-accent underline underline-offset-4"
          >
            {showHoursEditor ? "Hide" : "Edit"} {t("appointments.businessHours").toLowerCase()}
          </button>

          {showHoursEditor && <BusinessHoursForm agentId={selectedAgent} />}
        </>
      )}

      {agents.length === 0 && (
        <p className="text-sm text-muted">
          No agents found yet — make sure apps/api is running and seeded (`npm run prisma:seed`).
        </p>
      )}
    </div>
  );
}
