import type {
  Crewmate,
  CrewmateCreate,
  CrewmateUpdate,
  ErrorResponse,
  HealthResponse,
  Mission,
  MissionCreate,
  MissionUpdate,
  Ship,
  ShipCreate,
  ShipUpdate,
} from "../types/api";

export class ApiError extends Error {
  status: number;
  body: ErrorResponse | unknown;

  constructor(status: number, body: ErrorResponse | unknown) {
    super(typeof body === "object" && body !== null && "error" in body ? String((body as ErrorResponse).error) : `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(basePath: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${basePath}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}

export function createApiClient(basePath: string) {
  return {
    healthz: () => request<HealthResponse>(basePath, "/healthz"),

    listShips: () => request<Ship[]>(basePath, "/ships"),
    getShip: (id: string) => request<Ship>(basePath, `/ships/${id}`),
    createShip: (payload: ShipCreate) =>
      request<Ship>(basePath, "/ships", { method: "POST", body: JSON.stringify(payload) }),
    updateShip: (id: string, payload: ShipUpdate) =>
      request<Ship>(basePath, `/ships/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteShip: (id: string) => request<void>(basePath, `/ships/${id}`, { method: "DELETE" }),
    listShipCrewmates: (shipId: string) => request<Crewmate[]>(basePath, `/ships/${shipId}/crewmates`),
    listShipMissions: (shipId: string) => request<Mission[]>(basePath, `/ships/${shipId}/missions`),

    listCrewmates: () => request<Crewmate[]>(basePath, "/crewmates"),
    getCrewmate: (id: string) => request<Crewmate>(basePath, `/crewmates/${id}`),
    createCrewmate: (payload: CrewmateCreate) =>
      request<Crewmate>(basePath, "/crewmates", { method: "POST", body: JSON.stringify(payload) }),
    updateCrewmate: (id: string, payload: CrewmateUpdate) =>
      request<Crewmate>(basePath, `/crewmates/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteCrewmate: (id: string) => request<void>(basePath, `/crewmates/${id}`, { method: "DELETE" }),

    listMissions: () => request<Mission[]>(basePath, "/missions"),
    getMission: (id: string) => request<Mission>(basePath, `/missions/${id}`),
    createMission: (payload: MissionCreate) =>
      request<Mission>(basePath, "/missions", { method: "POST", body: JSON.stringify(payload) }),
    updateMission: (id: string, payload: MissionUpdate) =>
      request<Mission>(basePath, `/missions/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteMission: (id: string) => request<void>(basePath, `/missions/${id}`, { method: "DELETE" }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
