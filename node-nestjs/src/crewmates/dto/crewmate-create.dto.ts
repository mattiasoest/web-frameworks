import { CrewmateRole } from "@prisma/client";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CrewmateCreateDto {
  @IsUUID()
  ship_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(CrewmateRole)
  role!: CrewmateRole;

  @IsString()
  @IsNotEmpty()
  species!: string;

  @IsInt()
  rank!: number;
}
