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
import { ShipsService } from "./ships.service";
import { ShipCreateDto } from "./dto/ship-create.dto";
import { ShipUpdateDto } from "./dto/ship-update.dto";

@Controller("ships")
export class ShipsController {
  constructor(private readonly shipsService: ShipsService) {}

  @Get()
  findAll() {
    return this.shipsService.findAll();
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: ShipCreateDto) {
    return this.shipsService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.shipsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: ShipUpdateDto) {
    return this.shipsService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.shipsService.remove(id);
  }

  @Get(":id/crewmates")
  findCrewmates(@Param("id", ParseUUIDPipe) id: string) {
    return this.shipsService.findCrewmates(id);
  }

  @Get(":id/missions")
  findMissions(@Param("id", ParseUUIDPipe) id: string) {
    return this.shipsService.findMissions(id);
  }
}
