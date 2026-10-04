import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ESTARA demo data...");

  const agency = await prisma.agency.upsert({
    where: { slug: "estara-demo" },
    update: {},
    create: {
      name: "ESTARA Demo Agency",
      slug: "estara-demo",
      primaryColor: "#2563eb",
    },
  });

  const adminPasswordHash = await argon2.hash("Admin123!");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@estara.dev" },
    update: {},
    create: {
      email: "admin@estara.dev",
      passwordHash: adminPasswordHash,
      fullName: "ESTARA Admin",
      role: "AGENCY_ADMIN",
      agencyId: agency.id,
      isEmailVerified: true,
    },
  });

  const agentPasswordHash = await argon2.hash("Agent123!");
  const agentUser = await prisma.user.upsert({
    where: { email: "agent@estara.dev" },
    update: {},
    create: {
      email: "agent@estara.dev",
      passwordHash: agentPasswordHash,
      fullName: "Sara Ahmadi",
      role: "AGENT",
      agencyId: agency.id,
      isEmailVerified: true,
    },
  });

  const agent = await prisma.agent.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      agencyId: agency.id,
      fullName: "Sara Ahmadi",
      phone: "+994501234567",
      languages: ["en", "fa", "az"],
      specialties: ["Residential", "Luxury"],
    },
  });

  // Default business hours: Sat-Thu 09:00-18:00 with a lunch break, Friday closed.
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    await prisma.businessHours.upsert({
      where: { agentId_dayOfWeek: { agentId: agent.id, dayOfWeek } },
      update: {},
      create: {
        agentId: agent.id,
        dayOfWeek,
        isClosed: dayOfWeek === 5,
        openTime: "09:00",
        closeTime: "18:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        slotDurationMinutes: 30,
        timezone: "Asia/Baku",
      },
    });
  }

  const city = await prisma.city.upsert({
    where: { slug: "baku" },
    update: {},
    create: { name: "Baku", slug: "baku", country: "Azerbaijan" },
  });

  const neighborhood = await prisma.neighborhood.upsert({
    where: { slug: "baku-badamdar" },
    update: {},
    create: {
      cityId: city.id,
      name: "Badamdar",
      slug: "baku-badamdar",
      description: "Hillside residential district overlooking the bay.",
    },
  });

  const properties = [
    {
      title: "Modern 3BR Apartment with Sea View",
      price: 185000,
      areaSqm: 132,
      bedrooms: 3,
      bathrooms: 2,
      listingType: "BUY" as const,
      propertyType: "APARTMENT" as const,
    },
    {
      title: "Luxury Villa with Private Garden",
      price: 620000,
      areaSqm: 410,
      bedrooms: 5,
      bathrooms: 4,
      listingType: "BUY" as const,
      propertyType: "VILLA" as const,
    },
    {
      title: "Downtown Office Suite",
      price: 2400,
      areaSqm: 90,
      bedrooms: null,
      bathrooms: 1,
      listingType: "RENT" as const,
      propertyType: "OFFICE" as const,
    },
  ];

  for (const p of properties) {
    const slug = p.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const property = await prisma.property.upsert({
      where: { slug },
      update: {},
      create: {
        agencyId: agency.id,
        agentId: agent.id,
        cityId: city.id,
        neighborhoodId: neighborhood.id,
        title: p.title,
        slug,
        description: `${p.title} located in ${neighborhood.name}, ${city.name}.`,
        listingType: p.listingType,
        propertyType: p.propertyType,
        status: "PUBLISHED",
        price: p.price,
        currency: "USD",
        areaSqm: p.areaSqm,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        parkingSpaces: 1,
        amenities: ["parking", "elevator", "balcony"],
        latitude: 40.365 + Math.random() * 0.02,
        longitude: 49.835 + Math.random() * 0.02,
        isFeatured: true,
        publishedAt: new Date(),
      },
    });

    await prisma.propertyPriceHistory.upsert({
      where: { id: `${property.id}-seed` },
      update: {},
      create: { id: `${property.id}-seed`, propertyId: property.id, price: p.price, currency: "USD" },
    }).catch(() => undefined);
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@estara.dev / Admin123!");
  console.log("Agent login: agent@estara.dev / Agent123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
