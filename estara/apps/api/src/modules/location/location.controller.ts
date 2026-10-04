import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LocationService } from "./location.service";

@ApiTags("locations")
@Controller("locations")
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get("cities")
  cities() {
    return this.locationService.cities();
  }

  @Get("cities/:slug/neighborhoods")
  neighborhoods(@Param("slug") slug: string) {
    return this.locationService.neighborhoods(slug);
  }

  @Get("neighborhoods/:id/stats")
  stats(@Param("id") id: string) {
    return this.locationService.neighborhoodStats(id);
  }
}
