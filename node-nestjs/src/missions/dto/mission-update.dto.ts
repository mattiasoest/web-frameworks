import { MissionStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";

export class MissionUpdateDto {
  @IsOptional()
  @IsUUID()
  ship_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  codename?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  objective?: string;

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
