import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { BusinessHoursService } from "./business-hours.service";
import { SetBusinessHoursDto } from "./dto";

@ApiTags("business-hours")
@Controller("agents/:agentId/business-hours")
export class BusinessHoursController {
  constructor(private businessHoursService: BusinessHoursService) {}

  @Get()
  get(@Param("agentId") agentId: string) {
    return this.businessHoursService.getForAgent(agentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("AGENCY_ADMIN", "MANAGER", "AGENT")
  @Put()
  set(@Param("agentId") agentId: string, @Body() dto: SetBusinessHoursDto) {
    return this.businessHoursService.setForAgent(agentId, dto);
  }
}
