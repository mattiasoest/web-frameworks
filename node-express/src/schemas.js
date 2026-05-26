import { z } from "zod";

export const shipClassEnum = z.enum(["cruiser", "frigate", "destroyer", "scout"]);
export const crewmateRoleEnum = z.enum(["captain", "engineer", "medic", "pilot", "gunner"]);
export const missionStatusEnum = z.enum(["planned", "active", "completed", "failed"]);

export const shipCreateSchema = z.object({
  name: z.string().min(1),
  class: shipClassEnum,
  registry: z.string().min(1),
  warp_capable: z.boolean().optional().default(false),
});

export const shipUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    class: shipClassEnum.optional(),
    registry: z.string().min(1).optional(),
    warp_capable: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const crewmateCreateSchema = z.object({
  ship_id: z.string().uuid(),
  name: z.string().min(1),
  role: crewmateRoleEnum,
  species: z.string().min(1),
  rank: z.number().int(),
});

export const crewmateUpdateSchema = z
  .object({
    ship_id: z.string().uuid().optional(),
    name: z.string().min(1).optional(),
    role: crewmateRoleEnum.optional(),
    species: z.string().min(1).optional(),
    rank: z.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const missionCreateSchema = z.object({
  ship_id: z.string().uuid(),
  codename: z.string().min(1),
  objective: z.string().min(1),
  status: missionStatusEnum.optional().default("planned"),
  started_at: z.string().datetime().nullable().optional(),
  ended_at: z.string().datetime().nullable().optional(),
});

export const missionUpdateSchema = z
  .object({
    ship_id: z.string().uuid().optional(),
    codename: z.string().min(1).optional(),
    objective: z.string().min(1).optional(),
    status: missionStatusEnum.optional(),
    started_at: z.string().datetime().nullable().optional(),
    ended_at: z.string().datetime().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export function formatZodError(error) {
  return {
    error: "validation_failed",
    details: error.errors.map((e) => ({
      field: e.path.join(".") || "body",
      message: e.message,
    })),
  };
}
