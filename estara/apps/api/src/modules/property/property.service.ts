import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePropertyDto, SearchPropertyDto } from "./dto";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  async search(query: SearchPropertyDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.PropertyWhereInput = {
      status: "PUBLISHED",
      ...(query.listingType ? { listingType: query.listingType } : {}),
      ...(query.propertyType ? { propertyType: query.propertyType } : {}),
      ...(query.city ? { city: { slug: query.city } } : {}),
      ...(query.bedrooms ? { bedrooms: { gte: query.bedrooms } } : {}),
      ...(query.bathrooms ? { bathrooms: { gte: query.bathrooms } } : {}),
      price: {
        ...(query.minPrice ? { gte: query.minPrice } : {}),
        ...(query.maxPrice ? { lte: query.maxPrice } : {}),
      },
      areaSqm: {
        ...(query.minArea ? { gte: query.minArea } : {}),
        ...(query.maxArea ? { lte: query.maxArea } : {}),
      },
    };

    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      query.sort === "price_asc"
        ? { price: "asc" }
        : query.sort === "price_desc"
          ? { price: "desc" }
          : query.sort === "area_desc"
            ? { areaSqm: "desc" }
            : query.sort === "featured"
              ? { isFeatured: "desc" }
              : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { city: true, neighborhood: true, media: { orderBy: { order: "asc" }, take: 1 } },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      items: items.map((p) => this.toSummary(p)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findBySlug(slug: string) {
    const property = await this.prisma.property.findUnique({
      where: { slug },
      include: {
        city: true,
        neighborhood: true,
        media: { orderBy: { order: "asc" } },
        priceHistory: { orderBy: { changedAt: "desc" } },
        agent: true,
      },
    });
    if (!property) throw new NotFoundException("Property not found");
    return property;
  }

  async create(dto: CreatePropertyDto, agencyId: string) {
    const baseSlug = slugify(dto.title);
    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.property.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const property = await this.prisma.property.create({
      data: {
        ...dto,
        slug,
        agencyId,
        currency: dto.currency ?? "USD",
      },
    });

    await this.prisma.propertyPriceHistory.create({
      data: { propertyId: property.id, price: property.price, currency: property.currency },
    });
    await this.prisma.propertyStatusHistory.create({
      data: { propertyId: property.id, toStatus: "DRAFT" },
    });

    return property;
  }

  async updatePrice(propertyId: string, newPrice: number) {
    const property = await this.prisma.property.update({
      where: { id: propertyId },
      data: { price: newPrice },
    });
    await this.prisma.propertyPriceHistory.create({
      data: { propertyId, price: newPrice, currency: property.currency },
    });
    return property;
  }

  async publish(propertyId: string) {
    const current = await this.prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
    const property = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    await this.prisma.propertyStatusHistory.create({
      data: { propertyId, fromStatus: current.status, toStatus: "PUBLISHED" },
    });
    return property;
  }

  private toSummary(p: any) {
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      listingType: p.listingType,
      propertyType: p.propertyType,
      status: p.status,
      price: Number(p.price),
      currency: p.currency,
      areaSqm: Number(p.areaSqm),
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      city: p.city?.name ?? null,
      neighborhood: p.neighborhood?.name ?? null,
      coverImageUrl: p.media?.[0]?.url ?? null,
      isFeatured: p.isFeatured,
      location: { lat: p.latitude, lng: p.longitude },
    };
  }
}
