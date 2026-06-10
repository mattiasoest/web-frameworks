import { CrewmateRole } from "@prisma/client";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CrewmateUpdateDto {
  @IsOptional()
  @IsUUID()
  ship_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(CrewmateRole)
  role?: CrewmateRole;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  species?: string;

  @IsOptional()
  @IsInt()
  rank?: number;
}
