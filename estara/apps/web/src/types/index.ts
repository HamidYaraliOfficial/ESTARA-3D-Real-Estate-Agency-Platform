export interface PropertySummary {
  id: string;
  slug: string;
  title: string;
  listingType: string;
  propertyType: string;
  status: string;
  price: number;
  currency: string;
  areaSqm: number;
  bedrooms: number | null;
  bathrooms: number | null;
  city: string | null;
  neighborhood: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  location: { lat: number; lng: number };
}

export interface BusinessHoursDay {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  slotDurationMinutes: number;
  timezone: string;
}
