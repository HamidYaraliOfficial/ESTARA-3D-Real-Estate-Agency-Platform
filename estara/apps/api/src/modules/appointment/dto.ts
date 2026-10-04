import { IsDateString, IsEmail, IsOptional, IsString } from "class-validator";

export class CreateAppointmentDto {
  @IsString() agentId!: string;
  @IsOptional() @IsString() propertyId?: string;
  @IsString() clientName!: string;
  @IsEmail() clientEmail!: string;
  @IsString() clientPhone!: string;
  @IsDateString() startTime!: string;
  @IsOptional() @IsString() notes?: string;
}

export class AvailabilityQueryDto {
  @IsString() agentId!: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}
