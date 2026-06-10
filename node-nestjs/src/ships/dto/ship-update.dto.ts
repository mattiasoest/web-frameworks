import { ShipClass } from "@prisma/client";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ShipUpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(ShipClass)
  class?: ShipClass;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  registry?: string;

  @IsOptional()
  @IsBoolean()
  warp_capable?: boolean;
}
