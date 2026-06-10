import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { notFound, validationFailed } from "../common/exceptions";
import { serializeCrewmate, serializeMission, serializeShip } from "../common/serializers";
import { ShipCreateDto } from "./dto/ship-create.dto";
import { ShipUpdateDto } from "./dto/ship-update.dto";

@Injectable()
export class ShipsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const ships = await this.prisma.ship.findMany({ orderBy: { createdAt: "asc" } });
    return ships.map(serializeShip);
  }

  async findOne(id: string) {
    const ship = await this.prisma.ship.findUnique({ where: { id } });
    if (!ship) notFound();
    return serializeShip(ship);
  }

  async create(dto: ShipCreateDto) {
    try {
      const ship = await this.prisma.ship.create({
        data: {
          name: dto.name,
          class: dto.class,
          registry: dto.registry,
          warpCapable: dto.warp_capable ?? false,
        },
      });
      return serializeShip(ship);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        validationFailed([{ field: "registry", message: "Registry must be unique" }]);
      }
      throw error;
    }
  }

  async update(id: string, dto: ShipUpdateDto) {
    if (Object.keys(dto).length === 0) {
      validationFailed([{ field: "body", message: "At least one field is required" }]);
    }

    const data: Prisma.ShipUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.class !== undefined) data.class = dto.class;
    if (dto.registry !== undefined) data.registry = dto.registry;
    if (dto.warp_capable !== undefined) data.warpCapable = dto.warp_capable;

    try {
      const ship = await this.prisma.ship.update({ where: { id }, data });
      return serializeShip(ship);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") notFound();
        if (error.code === "P2002") {
          validationFailed([{ field: "registry", message: "Registry must be unique" }]);
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.ship.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        notFound();
      }
      throw error;
    }
  }

  async findCrewmates(shipId: string) {
    const ship = await this.prisma.ship.findUnique({ where: { id: shipId } });
    if (!ship) notFound();
    const crewmates = await this.prisma.crewmate.findMany({
      where: { shipId },
      orderBy: { rank: "asc" },
    });
    return crewmates.map(serializeCrewmate);
  }

  async findMissions(shipId: string) {
    const ship = await this.prisma.ship.findUnique({ where: { id: shipId } });
    if (!ship) notFound();
    const missions = await this.prisma.mission.findMany({
      where: { shipId },
      orderBy: { createdAt: "asc" },
    });
    return missions.map(serializeMission);
  }
}
