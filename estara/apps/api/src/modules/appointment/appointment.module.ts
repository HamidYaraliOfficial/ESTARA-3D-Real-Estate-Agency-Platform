import { Module } from "@nestjs/common";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";
import { BusinessHoursModule } from "../business-hours/business-hours.module";

@Module({
  imports: [BusinessHoursModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
