import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto";

@ApiTags("appointments")
@Controller("appointments")
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Get("availability")
  availability(
    @Query("agentId") agentId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.appointmentService.getAvailability(
      agentId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  /** Powers the "current time / time until next slot" widget on the frontend. */
  @Get("next-slot")
  nextSlot(@Query("agentId") agentId: string) {
    return this.appointmentService.getNextAvailableSlot(agentId);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/confirm")
  confirm(@Param("id") id: string) {
    return this.appointmentService.confirm(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/cancel")
  cancel(@Param("id") id: string) {
    return this.appointmentService.cancel(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/complete")
  complete(@Param("id") id: string) {
    return this.appointmentService.complete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/reschedule")
  reschedule(@Param("id") id: string, @Body("startTime") startTime: string) {
    return this.appointmentService.reschedule(id, startTime);
  }
}
