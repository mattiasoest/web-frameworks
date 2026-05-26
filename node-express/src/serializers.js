function toIso(date) {
  return date instanceof Date ? date.toISOString() : date;
}

export function serializeShip(ship) {
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

export function serializeCrewmate(crewmate) {
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

export function serializeMission(mission) {
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

export function shipCreateToPrisma(data) {
  return {
    name: data.name,
    class: data.class,
    registry: data.registry,
    warpCapable: data.warp_capable ?? false,
  };
}

export function shipUpdateToPrisma(data) {
  const update = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.class !== undefined) update.class = data.class;
  if (data.registry !== undefined) update.registry = data.registry;
  if (data.warp_capable !== undefined) update.warpCapable = data.warp_capable;
  return update;
}

export function crewmateCreateToPrisma(data) {
  return {
    shipId: data.ship_id,
    name: data.name,
    role: data.role,
    species: data.species,
    rank: data.rank,
  };
}

export function crewmateUpdateToPrisma(data) {
  const update = {};
  if (data.ship_id !== undefined) update.shipId = data.ship_id;
  if (data.name !== undefined) update.name = data.name;
  if (data.role !== undefined) update.role = data.role;
  if (data.species !== undefined) update.species = data.species;
  if (data.rank !== undefined) update.rank = data.rank;
  return update;
}

export function missionCreateToPrisma(data) {
  return {
    shipId: data.ship_id,
    codename: data.codename,
    objective: data.objective,
    status: data.status ?? "planned",
    startedAt: data.started_at ? new Date(data.started_at) : null,
    endedAt: data.ended_at ? new Date(data.ended_at) : null,
  };
}

export function missionUpdateToPrisma(data) {
  const update = {};
  if (data.ship_id !== undefined) update.shipId = data.ship_id;
  if (data.codename !== undefined) update.codename = data.codename;
  if (data.objective !== undefined) update.objective = data.objective;
  if (data.status !== undefined) update.status = data.status;
  if (data.started_at !== undefined) update.startedAt = data.started_at ? new Date(data.started_at) : null;
  if (data.ended_at !== undefined) update.endedAt = data.ended_at ? new Date(data.ended_at) : null;
  return update;
}
