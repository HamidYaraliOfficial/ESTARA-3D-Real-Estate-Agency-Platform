/**
 * Shared TypeScript contracts used by both apps/web and apps/api.
 * Keeping these in one package avoids type drift between the
 * frontend and the backend as the API evolves.
 */

export type Locale = "en" | "fa" | "zh";

export type ListingType = "buy" | "rent" | "commercial" | "land" | "new-project";

export type PropertyType =
  | "apartment"
  | "villa"
  | "office"
  | "shop"
  | "warehouse"
  | "land";

export type PropertyStatus =
  | "draft"
  | "in_review"
  | "published"
  | "reserved"
  | "sold"
  | "rented"
  | "archived";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PropertySummary {
  id: string;
  slug: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: string;
  areaSqm: number;
  bedrooms: number | null;
  bathrooms: number | null;
  city: string;
  neighborhood: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  location: GeoPoint;
}

export interface PropertyDetail extends PropertySummary {
  description: string;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  parkingSpaces: number;
  amenities: string[];
  media: PropertyMedia[];
  agent: AgentSummary | null;
  priceHistory: PricePoint[];
}

export interface PropertyMedia {
  id: string;
  url: string;
  type: "image" | "video" | "panorama" | "model3d";
  order: number;
  caption: string | null;
}

export interface PricePoint {
  price: number;
  currency: string;
  changedAt: string;
}

export interface AgentSummary {
  id: string;
  fullName: string;
  photoUrl: string | null;
  phone: string;
  email: string;
  languages: string[];
}

export interface PropertySearchFilters {
  listingType?: ListingType;
  propertyType?: PropertyType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  sort?: "newest" | "price_asc" | "price_desc" | "area_desc" | "featured";
  page?: number;
  pageSize?: number;
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  source: string;
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "viewing_scheduled"
    | "negotiating"
    | "won"
    | "lost"
    | "archived";
  propertyId: string | null;
  assignedAgentId: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  createdAt: string;
}

/** One weekday's opening hours for an agent, fully editable by the user. */
export interface BusinessHours {
  id: string;
  agentId: string;
  /** 0 = Sunday ... 6 = Saturday */
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
  breakStart: string | null;
  breakEnd: string | null;
  slotDurationMinutes: number;
  timezone: string;
}

export interface AvailableSlot {
  start: string; // ISO datetime
  end: string; // ISO datetime
}

export interface NextAvailableSlotResult {
  now: string; // ISO datetime, server's current time in the agent's timezone
  timezone: string;
  nextSlot: AvailableSlot | null;
  minutesUntilNextSlot: number | null;
  humanReadable: string | null;
}

export interface Appointment {
  id: string;
  agentId: string;
  propertyId: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "rescheduled" | "cancelled" | "completed";
  notes: string | null;
}
