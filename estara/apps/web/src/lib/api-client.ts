const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface PropertySearchParams {
  listingType?: string;
  propertyType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export const api = {
  properties: {
    search: (params: PropertySearchParams = {}) => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      );
      return request<{ items: unknown[]; total: number; page: number; totalPages: number }>(
        `/properties?${query.toString()}`,
      );
    },
    getBySlug: (slug: string) => request(`/properties/${slug}`),
  },
  locations: {
    cities: () => request<{ id: string; name: string; slug: string }[]>("/locations/cities"),
    neighborhoods: (citySlug: string) =>
      request(`/locations/cities/${citySlug}/neighborhoods`),
  },
  agents: {
    list: () => request<{ id: string; fullName: string }[]>("/agents"),
    get: (id: string) => request(`/agents/${id}`),
  },
  appointments: {
    nextSlot: (agentId: string) =>
      request<{
        now: string;
        timezone: string;
        nextSlot: { start: string; end: string } | null;
        minutesUntilNextSlot: number | null;
        humanReadable: string | null;
      }>(`/appointments/next-slot?agentId=${agentId}`),
    availability: (agentId: string, from?: string, to?: string) => {
      const q = new URLSearchParams({ agentId, ...(from ? { from } : {}), ...(to ? { to } : {}) });
      return request<{ date: string; slots: { start: string; end: string }[] }[]>(
        `/appointments/availability?${q.toString()}`,
      );
    },
    create: (payload: {
      agentId: string;
      propertyId?: string;
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      startTime: string;
      notes?: string;
    }) => request("/appointments", { method: "POST", body: JSON.stringify(payload) }),
  },
  businessHours: {
    get: (agentId: string) => request(`/agents/${agentId}/business-hours`),
    set: (agentId: string, days: unknown[], token: string) =>
      request(`/agents/${agentId}/business-hours`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days }),
      }),
  },
  leads: {
    create: (payload: {
      fullName: string;
      email: string;
      phone: string;
      source?: string;
      propertyId?: string;
      notes?: string;
    }) => request("/leads", { method: "POST", body: JSON.stringify(payload) }),
  },
};
