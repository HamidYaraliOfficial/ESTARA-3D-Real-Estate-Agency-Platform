import Link from "next/link";
import { getDictionary, isLocale, defaultLocale } from "@/i18n/config";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface Agent {
  id: string;
  fullName: string;
  phone: string;
  languages: string[];
}

async function getAgents(): Promise<Agent[]> {
  try {
    const res = await fetch(`${API_URL}/agents`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function AgentsPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);
  const agents = await getAgents();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{dict.nav.agents}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {agents.map((agent) => (
          <div key={agent.id} className="mica-surface rounded-win p-5">
            <p className="text-lg font-semibold">{agent.fullName}</p>
            <p className="text-sm text-muted">{agent.phone}</p>
            <p className="text-xs text-muted">{agent.languages?.join(", ")}</p>
            <Link
              href={`/${locale}/appointments`}
              className="mt-3 inline-block text-sm text-accent underline underline-offset-4"
            >
              {dict.property.scheduleViewing}
            </Link>
          </div>
        ))}
        {agents.length === 0 && (
          <p className="text-sm text-muted">
            No agents yet — seed the database with `npm run prisma:seed` in apps/api.
          </p>
        )}
      </div>
    </div>
  );
}
