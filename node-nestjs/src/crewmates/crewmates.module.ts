import { Module } from "@nestjs/common";
import { CrewmatesController } from "./crewmates.controller";
import { CrewmatesService } from "./crewmates.service";

@Module({
  controllers: [CrewmatesController],
  providers: [CrewmatesService],
})
export class CrewmatesModule {}
