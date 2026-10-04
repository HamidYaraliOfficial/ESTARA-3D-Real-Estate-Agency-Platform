import { PropertyGrid } from "@/components/property/property-grid";
import { getDictionary, isLocale, defaultLocale } from "@/i18n/config";

export default function PropertiesPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { listingType?: string; city?: string; q?: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{dict.nav.properties}</h1>
      <PropertyGrid listingType={searchParams.listingType} city={searchParams.city} />
    </div>
  );
}
