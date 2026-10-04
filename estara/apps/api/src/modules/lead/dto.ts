import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { LeadStatus } from "@prisma/client";

export class CreateLeadDto {
  @IsString() fullName!: string;
  @IsEmail() email!: string;
  @IsString() phone!: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsString() propertyId?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus) status!: LeadStatus;
  @IsOptional() @IsString() changedBy?: string;
}
