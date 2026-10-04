import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PropertyService } from "./property.service";
import { CreatePropertyDto, SearchPropertyDto } from "./dto";

@ApiTags("properties")
@Controller("properties")
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Get()
  search(@Query() query: SearchPropertyDto) {
    return this.propertyService.search(query);
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.propertyService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("AGENCY_ADMIN", "MANAGER", "AGENT")
  @Post()
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: any) {
    return this.propertyService.create(dto, user.agencyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("AGENCY_ADMIN", "MANAGER", "AGENT")
  @Patch(":id/price")
  updatePrice(@Param("id") id: string, @Body("price") price: number) {
    return this.propertyService.updatePrice(id, price);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("AGENCY_ADMIN", "MANAGER")
  @Patch(":id/publish")
  publish(@Param("id") id: string) {
    return this.propertyService.publish(id);
  }
}
