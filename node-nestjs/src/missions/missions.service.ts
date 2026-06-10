import { Injectable } from "@nestjs/common";
import { MissionStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { notFound, validationFailed } from "../common/exceptions";
import { serializeMission } from "../common/serializers";
import { MissionCreateDto } from "./dto/mission-create.dto";
import { MissionUpdateDto } from "./dto/mission-update.dto";

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const missions = await this.prisma.mission.findMany({ orderBy: { createdAt: "asc" } });
    return missions.map(serializeMission);
  }

  async findOne(id: string) {
    const mission = await this.prisma.mission.findUnique({ where: { id } });
    if (!mission) notFound();
    return serializeMission(mission);
  }

  async create(dto: MissionCreateDto) {
    try {
      const mission = await this.prisma.mission.create({
        data: {
          shipId: dto.ship_id,
          codename: dto.codename,
          objective: dto.objective,
          status: dto.status ?? MissionStatus.planned,
          startedAt: dto.started_at ? new Date(dto.started_at) : null,
          endedAt: dto.ended_at ? new Date(dto.ended_at) : null,
        },
      });
      return serializeMission(mission);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        validationFailed([{ field: "ship_id", message: "Ship does not exist" }]);
      }
      throw error;
    }
  }

  async update(id: string, dto: MissionUpdateDto) {
    if (Object.keys(dto).length === 0) {
      validationFailed([{ field: "body", message: "At least one field is required" }]);
    }

    const data: Prisma.MissionUpdateInput = {};
    if (dto.ship_id !== undefined) data.ship = { connect: { id: dto.ship_id } };
    if (dto.codename !== undefined) data.codename = dto.codename;
    if (dto.objective !== undefined) data.objective = dto.objective;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.started_at !== undefined) {
      data.startedAt = dto.started_at ? new Date(dto.started_at) : null;
    }
    if (dto.ended_at !== undefined) {
      data.endedAt = dto.ended_at ? new Date(dto.ended_at) : null;
    }

    try {
      const mission = await this.prisma.mission.update({ where: { id }, data });
      return serializeMission(mission);
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
      await this.prisma.mission.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        notFound();
      }
      throw error;
    }
  }
}
