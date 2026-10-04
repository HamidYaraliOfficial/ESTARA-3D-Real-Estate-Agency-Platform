import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { LeadService } from "./lead.service";
import { CreateLeadDto, UpdateLeadStatusDto } from "./dto";

@ApiTags("leads")
@Controller("leads")
export class LeadController {
  constructor(private leadService: LeadService) {}

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("pipeline")
  pipeline(@Query("agentId") agentId?: string) {
    return this.leadService.pipeline(agentId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.leadService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/assign/:agentId")
  assign(@Param("id") id: string, @Param("agentId") agentId: string) {
    return this.leadService.assignAgent(id, agentId);
  }
}
