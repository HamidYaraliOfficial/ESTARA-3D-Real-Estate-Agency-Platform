import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  async list(agencyId?: string) {
    return this.prisma.agent.findMany({
      where: agencyId ? { agencyId } : undefined,
      include: { user: { select: { email: true } } },
    });
  }

  async findOne(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        properties: { where: { status: "PUBLISHED" }, take: 12 },
        businessHours: { orderBy: { dayOfWeek: "asc" } },
      },
    });
    if (!agent) throw new NotFoundException("Agent not found");
    return agent;
  }
}
