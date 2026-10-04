"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { BedDouble, Bath, Ruler, Star } from "lucide-react";
import { PropertySummary } from "@/types";
import { useLocale } from "@/i18n/locale-provider";
import { formatCurrency } from "@/lib/utils";

/**
 * Tilts and lifts on pointer move to give a light, cinematic feel without
 * pulling in a full 3D scene per card — cheap enough to run dozens of these
 * on a listing page at once.
 */
export function PropertyCard({ property }: { property: PropertySummary }) {
  const { t, locale } = useLocale();
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`,
    );
  }

  return (
    <Link
      href={`/${locale}/properties/${property.slug}`}
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTransform("")}
      style={{ transform, transition: "transform 0.25s ease" }}
      className="mica-surface group block overflow-hidden rounded-win will-change-transform"
    >
      <div className="relative h-48 w-full overflow-hidden bg-muted/20">
        {property.coverImageUrl ? (
          <Image
            src={property.coverImageUrl}
            alt={property.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            {property.title}
          </div>
        )}
        {property.isFeatured && (
          <span className="accent-bg absolute start-3 top-3 flex items-center gap-1 rounded-win px-2 py-1 text-xs font-medium">
            <Star size={12} /> {t("property.featured")}
          </span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold">{property.title}</h3>
        </div>
        <p className="text-lg font-bold text-accent">
          {formatCurrency(property.price, property.currency, locale)}
        </p>
        <p className="text-xs text-muted">
          {[property.neighborhood, property.city].filter(Boolean).join(", ")}
        </p>
        <div className="flex items-center gap-4 pt-1 text-xs text-foreground/70">
          {property.bedrooms !== null && (
            <span className="flex items-center gap-1">
              <BedDouble size={14} /> {property.bedrooms} {t("property.bedrooms")}
            </span>
          )}
          {property.bathrooms !== null && (
            <span className="flex items-center gap-1">
              <Bath size={14} /> {property.bathrooms} {t("property.bathrooms")}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler size={14} /> {property.areaSqm} {t("property.area")}
          </span>
        </div>
      </div>
    </Link>
  );
}
