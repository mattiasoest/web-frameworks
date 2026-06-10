import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { MissionsService } from "./missions.service";
import { MissionCreateDto } from "./dto/mission-create.dto";
import { MissionUpdateDto } from "./dto/mission-update.dto";

@Controller("missions")
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  findAll() {
    return this.missionsService.findAll();
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: MissionCreateDto) {
    return this.missionsService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.missionsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: MissionUpdateDto) {
    return this.missionsService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.missionsService.remove(id);
  }
}
