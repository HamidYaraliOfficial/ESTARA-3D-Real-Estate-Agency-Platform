import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class DayHoursDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @IsOptional() @IsBoolean() isClosed?: boolean;
  @Matches(TIME_PATTERN, { message: "openTime must be HH:mm" }) openTime!: string;
  @Matches(TIME_PATTERN, { message: "closeTime must be HH:mm" }) closeTime!: string;
  @IsOptional() @Matches(TIME_PATTERN) breakStart?: string;
  @IsOptional() @Matches(TIME_PATTERN) breakEnd?: string;
  @IsOptional() @IsInt() @Min(5) @Max(240) slotDurationMinutes?: number;
  @IsOptional() @IsString() timezone?: string;
}

/** The whole weekly schedule is submitted and upserted together. */
export class SetBusinessHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayHoursDto)
  days!: DayHoursDto[];
}
