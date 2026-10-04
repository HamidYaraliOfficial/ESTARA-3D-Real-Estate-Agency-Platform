"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { PropertySummary } from "@/types";
import { PropertyCard } from "./property-card";

export function PropertyGrid({
  listingType,
  city,
}: {
  listingType?: string;
  city?: string;
}) {
  const [items, setItems] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.properties
      .search({ listingType, city, pageSize: 12 })
      .then((res) => {
        if (!cancelled) setItems(res.items as PropertySummary[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingType, city]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mica-surface h-72 animate-pulse rounded-win" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-muted">
        Could not load properties from the API ({error}). Make sure apps/api is running.
      </p>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">No properties match this search yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
