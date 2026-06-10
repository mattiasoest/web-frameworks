import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";
import { ShipsModule } from "./ships/ships.module";
import { CrewmatesModule } from "./crewmates/crewmates.module";
import { MissionsModule } from "./missions/missions.module";

@Module({
  imports: [PrismaModule, ShipsModule, CrewmatesModule, MissionsModule],
  controllers: [HealthController],
})
export class AppModule {}
