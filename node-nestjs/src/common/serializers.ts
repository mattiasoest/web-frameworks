import { Ship, Crewmate, Mission } from "@prisma/client";

function toIso(date: Date): string {
  return date.toISOString();
}

export function serializeShip(ship: Ship) {
  return {
    id: ship.id,
    name: ship.name,
    class: ship.class,
    registry: ship.registry,
    warp_capable: ship.warpCapable,
    created_at: toIso(ship.createdAt),
    updated_at: toIso(ship.updatedAt),
  };
}

export function serializeCrewmate(crewmate: Crewmate) {
  return {
    id: crewmate.id,
    ship_id: crewmate.shipId,
    name: crewmate.name,
    role: crewmate.role,
    species: crewmate.species,
    rank: crewmate.rank,
    created_at: toIso(crewmate.createdAt),
    updated_at: toIso(crewmate.updatedAt),
  };
}

export function serializeMission(mission: Mission) {
  return {
    id: mission.id,
    ship_id: mission.shipId,
    codename: mission.codename,
    objective: mission.objective,
    status: mission.status,
    started_at: mission.startedAt ? toIso(mission.startedAt) : null,
    ended_at: mission.endedAt ? toIso(mission.endedAt) : null,
    created_at: toIso(mission.createdAt),
    updated_at: toIso(mission.updatedAt),
  };
}
