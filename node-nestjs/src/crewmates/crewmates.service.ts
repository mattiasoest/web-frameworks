import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { notFound, validationFailed } from "../common/exceptions";
import { serializeCrewmate } from "../common/serializers";
import { CrewmateCreateDto } from "./dto/crewmate-create.dto";
import { CrewmateUpdateDto } from "./dto/crewmate-update.dto";

@Injectable()
export class CrewmatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const crewmates = await this.prisma.crewmate.findMany({ orderBy: { createdAt: "asc" } });
    return crewmates.map(serializeCrewmate);
  }

  async findOne(id: string) {
    const crewmate = await this.prisma.crewmate.findUnique({ where: { id } });
    if (!crewmate) notFound();
    return serializeCrewmate(crewmate);
  }

  async create(dto: CrewmateCreateDto) {
    try {
      const crewmate = await this.prisma.crewmate.create({
        data: {
          shipId: dto.ship_id,
          name: dto.name,
          role: dto.role,
          species: dto.species,
          rank: dto.rank,
        },
      });
      return serializeCrewmate(crewmate);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        validationFailed([{ field: "ship_id", message: "Ship does not exist" }]);
      }
      throw error;
    }
  }

  async update(id: string, dto: CrewmateUpdateDto) {
    if (Object.keys(dto).length === 0) {
      validationFailed([{ field: "body", message: "At least one field is required" }]);
    }

    const data: Prisma.CrewmateUpdateInput = {};
    if (dto.ship_id !== undefined) data.ship = { connect: { id: dto.ship_id } };
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.species !== undefined) data.species = dto.species;
    if (dto.rank !== undefined) data.rank = dto.rank;

    try {
      const crewmate = await this.prisma.crewmate.update({ where: { id }, data });
      return serializeCrewmate(crewmate);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") notFound();
        if (error.code === "P2003") {
          validationFailed([{ field: "ship_id", message: "Ship does not exist" }]);
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.crewmate.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        notFound();
      }
      throw error;
    }
  }
}
