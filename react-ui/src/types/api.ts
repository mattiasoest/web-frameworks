export type ShipClass = "cruiser" | "frigate" | "destroyer" | "scout";
export type CrewmateRole = "captain" | "engineer" | "medic" | "pilot" | "gunner";
export type MissionStatus = "planned" | "active" | "completed" | "failed";

export interface Ship {
  id: string;
  name: string;
  class: ShipClass;
  registry: string;
  warp_capable: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShipCreate {
  name: string;
  class: ShipClass;
  registry: string;
  warp_capable?: boolean;
}

export interface ShipUpdate {
  name?: string;
  class?: ShipClass;
  registry?: string;
  warp_capable?: boolean;
}

export interface Crewmate {
  id: string;
  ship_id: string;
  name: string;
  role: CrewmateRole;
  species: string;
  rank: number;
  created_at: string;
  updated_at: string;
}

export interface CrewmateCreate {
  ship_id: string;
  name: string;
  role: CrewmateRole;
  species: string;
  rank: number;
}

export interface CrewmateUpdate {
  ship_id?: string;
  name?: string;
  role?: CrewmateRole;
  species?: string;
  rank?: number;
}

export interface Mission {
  id: string;
  ship_id: string;
  codename: string;
  objective: string;
  status: MissionStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissionCreate {
  ship_id: string;
  codename: string;
  objective: string;
  status?: MissionStatus;
  started_at?: string | null;
  ended_at?: string | null;
}

export interface MissionUpdate {
  ship_id?: string;
  codename?: string;
  objective?: string;
  status?: MissionStatus;
  started_at?: string | null;
  ended_at?: string | null;
}

export interface ValidationDetail {
  field: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
  details?: ValidationDetail[];
}

export interface HealthResponse {
  status: string;
}

export const SHIP_CLASSES: ShipClass[] = ["cruiser", "frigate", "destroyer", "scout"];
export const CREWMATE_ROLES: CrewmateRole[] = ["captain", "engineer", "medic", "pilot", "gunner"];
export const MISSION_STATUSES: MissionStatus[] = ["planned", "active", "completed", "failed"];
