import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  cities() {
    return this.prisma.city.findMany({ orderBy: { name: "asc" } });
  }

  async neighborhoods(citySlug: string) {
    return this.prisma.neighborhood.findMany({
      where: { city: { slug: citySlug } },
      orderBy: { name: "asc" },
    });
  }

  /** Basic market stats computed straight from stored listings. */
  async neighborhoodStats(neighborhoodId: string) {
    const agg = await this.prisma.property.aggregate({
      where: { neighborhoodId, status: "PUBLISHED" },
      _avg: { price: true, areaSqm: true },
      _count: { _all: true },
    });
    return {
      propertyCount: agg._count._all,
      averagePrice: agg._avg.price ? Number(agg._avg.price) : null,
      averageArea: agg._avg.areaSqm ? Number(agg._avg.areaSqm) : null,
    };
  }
}
