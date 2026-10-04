import Image from "next/image";
import { notFound } from "next/navigation";
import { BedDouble, Bath, Ruler, MapPin, Phone, Mail } from "lucide-react";
import { getDictionary, isLocale, defaultLocale } from "@/i18n/config";
import { NextSlotWidget } from "@/components/appointment/next-slot-widget";
import { BookingForm } from "@/components/appointment/booking-form";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function getProperty(slug: string) {
  try {
    const res = await fetch(`${API_URL}/properties/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);
  const property = await getProperty(params.slug);

  if (!property) {
    // The API might simply not be running yet in a fresh checkout —
    // show a helpful empty state instead of a hard crash where possible.
    notFound();
  }

  const cover = property.media?.[0]?.url as string | undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-10">
      {/* Overview */}
      <section className="space-y-4">
        <div className="relative h-96 w-full overflow-hidden rounded-win bg-muted/20">
          {cover ? (
            <Image src={cover} alt={property.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              {property.title}
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <p className="flex items-center gap-1 text-muted">
          <MapPin size={16} />
          {[property.neighborhood?.name, property.city?.name].filter(Boolean).join(", ")}
        </p>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {property.bedrooms !== null && (
            <span className="flex items-center gap-1">
              <BedDouble size={16} /> {property.bedrooms} {dict.property.bedrooms}
            </span>
          )}
          {property.bathrooms !== null && (
            <span className="flex items-center gap-1">
              <Bath size={16} /> {property.bathrooms} {dict.property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler size={16} /> {Number(property.areaSqm)} {dict.property.area}
          </span>
        </div>
        <p className="text-2xl font-bold text-accent">
          {Number(property.price).toLocaleString()} {property.currency}
        </p>
      </section>

      {/* Description / Amenities */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="mb-3 text-xl font-semibold">Overview</h2>
          <p className="leading-relaxed text-foreground/80">{property.description}</p>
        </div>
        <div>
          <h2 className="mb-3 text-xl font-semibold">Amenities</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm text-foreground/80">
            {(property.amenities as string[])?.map((a) => (
              <li key={a} className="mica-surface rounded-win px-3 py-1.5">
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Price history */}
      {property.priceHistory?.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Price history</h2>
          <ul className="space-y-1 text-sm text-foreground/80">
            {property.priceHistory.map((p: { changedAt: string; price: number; currency: string }, i: number) => (
              <li key={i} className="flex justify-between border-b border-border py-1">
                <span>{new Date(p.changedAt).toLocaleDateString()}</span>
                <span>
                  {Number(p.price).toLocaleString()} {p.currency}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Agent */}
      {property.agent && (
        <section className="mica-surface flex flex-wrap items-center justify-between gap-4 rounded-win p-5">
          <div>
            <p className="text-sm text-muted">Listed by</p>
            <p className="text-lg font-semibold">{property.agent.fullName}</p>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Phone size={14} /> {property.agent.phone}
            </span>
          </div>
        </section>
      )}

      {/* Schedule a viewing */}
      {property.agentId && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{dict.property.scheduleViewing}</h2>
          <NextSlotWidget agentId={property.agentId} />
          <BookingForm agentId={property.agentId} propertyId={property.id} />
        </section>
      )}
    </div>
  );
}
