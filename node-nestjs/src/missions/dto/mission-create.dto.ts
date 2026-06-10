import { MissionStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";

export class MissionCreateDto {
  @IsUUID()
  ship_id!: string;

  @IsString()
  @IsNotEmpty()
  codename!: string;

  @IsString()
  @IsNotEmpty()
  objective!: string;

  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  started_at?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  ended_at?: string | null;
}
