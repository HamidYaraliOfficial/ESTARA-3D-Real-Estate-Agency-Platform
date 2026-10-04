import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PropertyModule } from "./modules/property/property.module";
import { AgentModule } from "./modules/agent/agent.module";
import { LocationModule } from "./modules/location/location.module";
import { LeadModule } from "./modules/lead/lead.module";
import { BusinessHoursModule } from "./modules/business-hours/business-hours.module";
import { AppointmentModule } from "./modules/appointment/appointment.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PropertyModule,
    AgentModule,
    LocationModule,
    LeadModule,
    BusinessHoursModule,
    AppointmentModule,
  ],
})
export class AppModule {}
