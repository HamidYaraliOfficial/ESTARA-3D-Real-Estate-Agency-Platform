import { Injectable, NotFoundException } from "@nestjs/common";
import { LeadStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateLeadDto, UpdateLeadStatusDto } from "./dto";

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: { ...dto, source: dto.source ?? "website" },
    });
    await this.prisma.leadStatusHistory.create({
      data: { leadId: lead.id, toStatus: "NEW" },
    });
    return lead;
  }

  /** The Kanban board reads this — one query per column. */
  async pipeline(agentId?: string) {
    const statuses: LeadStatus[] = [
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "VIEWING_SCHEDULED",
      "NEGOTIATING",
      "WON",
      "LOST",
    ];
    const columns = await Promise.all(
      statuses.map((status) =>
        this.prisma.lead.findMany({
          where: { status, ...(agentId ? { assignedAgentId: agentId } : {}) },
          orderBy: { updatedAt: "desc" },
        }),
      ),
    );
    return statuses.reduce(
      (acc, status, i) => ({ ...acc, [status]: columns[i] }),
      {} as Record<LeadStatus, unknown[]>,
    );
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto) {
    const current = await this.prisma.lead.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Lead not found");

    const lead = await this.prisma.lead.update({
      where: { id },
      data: { status: dto.status },
    });
    await this.prisma.leadStatusHistory.create({
      data: {
        leadId: id,
        fromStatus: current.status,
        toStatus: dto.status,
        changedBy: dto.changedBy,
      },
    });
    return lead;
  }

  async assignAgent(id: string, agentId: string) {
    return this.prisma.lead.update({ where: { id }, data: { assignedAgentId: agentId } });
  }
}
