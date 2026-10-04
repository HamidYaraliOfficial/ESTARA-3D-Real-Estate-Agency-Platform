import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AgentService } from "./agent.service";

@ApiTags("agents")
@Controller("agents")
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get()
  list(@Query("agencyId") agencyId?: string) {
    return this.agentService.list(agencyId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.agentService.findOne(id);
  }
}
