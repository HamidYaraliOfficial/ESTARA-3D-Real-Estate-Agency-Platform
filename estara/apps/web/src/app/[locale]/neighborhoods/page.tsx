import { getDictionary, isLocale, defaultLocale } from "@/i18n/config";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface City {
  id: string;
  name: string;
  slug: string;
}

async function getCities(): Promise<City[]> {
  try {
    const res = await fetch(`${API_URL}/locations/cities`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function NeighborhoodsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);
  const cities = await getCities();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{dict.nav.neighborhoods}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cities.map((city) => (
          <div key={city.id} className="mica-surface rounded-win p-5">
            <p className="text-lg font-semibold">{city.name}</p>
          </div>
        ))}
        {cities.length === 0 && (
          <p className="text-sm text-muted">
            No cities yet — seed the database with `npm run prisma:seed` in apps/api.
          </p>
        )}
      </div>
    </div>
  );
}
