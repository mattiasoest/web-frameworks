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
import { CrewmatesService } from "./crewmates.service";
import { CrewmateCreateDto } from "./dto/crewmate-create.dto";
import { CrewmateUpdateDto } from "./dto/crewmate-update.dto";

@Controller("crewmates")
export class CrewmatesController {
  constructor(private readonly crewmatesService: CrewmatesService) {}

  @Get()
  findAll() {
    return this.crewmatesService.findAll();
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CrewmateCreateDto) {
    return this.crewmatesService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.crewmatesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: CrewmateUpdateDto) {
    return this.crewmatesService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.crewmatesService.remove(id);
  }
}
