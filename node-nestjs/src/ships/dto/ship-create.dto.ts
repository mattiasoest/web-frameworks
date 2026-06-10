import { ShipClass } from "@prisma/client";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ShipCreateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(ShipClass)
  class!: ShipClass;

  @IsString()
  @IsNotEmpty()
  registry!: string;

  @IsOptional()
  @IsBoolean()
  warp_capable?: boolean;
}
