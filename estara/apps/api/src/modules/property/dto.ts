import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { ListingType, PropertyType } from "@prisma/client";

export class CreatePropertyDto {
  @IsString() title!: string;
  @IsString() description!: string;
  @IsEnum(ListingType) listingType!: ListingType;
  @IsEnum(PropertyType) propertyType!: PropertyType;
  @IsNumber() price!: number;
  @IsOptional() @IsString() currency?: string;
  @IsNumber() areaSqm!: number;
  @IsOptional() @IsInt() bedrooms?: number;
  @IsOptional() @IsInt() bathrooms?: number;
  @IsOptional() @IsInt() floor?: number;
  @IsOptional() @IsInt() totalFloors?: number;
  @IsOptional() @IsInt() yearBuilt?: number;
  @IsOptional() @IsInt() parkingSpaces?: number;
  @IsOptional() @IsArray() amenities?: string[];
  @IsNumber() latitude!: number;
  @IsNumber() longitude!: number;
  @IsString() cityId!: string;
  @IsOptional() @IsString() neighborhoodId?: string;
  @IsOptional() @IsString() agentId?: string;
}

export class SearchPropertyDto {
  @IsOptional() @IsEnum(ListingType) listingType?: ListingType;
  @IsOptional() @IsEnum(PropertyType) propertyType?: PropertyType;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @Type(() => Number) @IsNumber() minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maxPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() minArea?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maxArea?: number;
  @IsOptional() @Type(() => Number) @IsInt() bedrooms?: number;
  @IsOptional() @Type(() => Number) @IsInt() bathrooms?: number;
  @IsOptional()
  @IsIn(["newest", "price_asc", "price_desc", "area_desc", "featured"])
  sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
}
