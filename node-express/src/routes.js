import { Router } from "express";
import { Prisma } from "@prisma/client";
import {
  shipCreateSchema,
  shipUpdateSchema,
  crewmateCreateSchema,
  crewmateUpdateSchema,
  missionCreateSchema,
  missionUpdateSchema,
  formatZodError,
} from "./schemas.js";
import {
  serializeShip,
  serializeCrewmate,
  serializeMission,
  shipCreateToPrisma,
  shipUpdateToPrisma,
  crewmateCreateToPrisma,
  crewmateUpdateToPrisma,
  missionCreateToPrisma,
  missionUpdateToPrisma,
} from "./serializers.js";

function isNotFound(error) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

function isForeignKey(error) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}

function isUniqueViolation(error) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function createRoutes(prisma) {
  const router = Router();

  router.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Ships
  router.get("/ships", async (_req, res) => {
    const ships = await prisma.ship.findMany({ orderBy: { createdAt: "asc" } });
    res.json(ships.map(serializeShip));
  });

  router.post("/ships", async (req, res) => {
    const parsed = shipCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatZodError(parsed.error));
    }
    try {
      const ship = await prisma.ship.create({ data: shipCreateToPrisma(parsed.data) });
      res.status(201).json(serializeShip(ship));
    } catch (error) {
      if (isUniqueViolation(error)) {
        return res.status(400).json({
          error: "validation_failed",
          details: [{ field: "registry", message: "Registry must be unique" }],
        });
      }
      throw error;
    }
  });

  router.get("/ships/:id", async (req, res) => {
    const ship = await prisma.ship.findUnique({ where: { id: req.params.id } });
    if (!ship) return res.status(404).json({ error: "not_found" });
    res.json(serializeShip(ship));
  });

  router.patch("/ships/:id", async (req, res) => {
    const parsed = shipUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatZodError(parsed.error));
    }
    try {
      const ship = await prisma.ship.update({
        where: { id: req.params.id },
        data: shipUpdateToPrisma(parsed.data),
      });
      res.json(serializeShip(ship));
    } catch (error) {
      if (isNotFound(error)) return res.status(404).json({ error: "not_found" });
      if (isUniqueViolation(error)) {
        return res.status(400).json({
          error: "validation_failed",
          details: [{ field: "registry", message: "Registry must be unique" }],
        });
      }
      throw error;
    }
  });

  router.delete("/ships/:id", async (req, res) => {
    try {
      await prisma.ship.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      if (isNotFound(error)) return res.status(404).json({ error: "not_found" });
      throw error;
    }
  });

  router.get("/ships/:id/crewmates", async (req, res) => {
    const ship = await prisma.ship.findUnique({ where: { id: req.params.id } });
    if (!ship) return res.status(404).json({ error: "not_found" });
    const crewmates = await prisma.crewmate.findMany({
      where: { shipId: req.params.id },
      orderBy: { rank: "asc" },
    });
    res.json(crewmates.map(serializeCrewmate));
  });

  router.get("/ships/:id/missions", async (req, res) => {
    const ship = await prisma.ship.findUnique({ where: { id: req.params.id } });
    if (!ship) return res.status(404).json({ error: "not_found" });
    const missions = await prisma.mission.findMany({
      where: { shipId: req.params.id },
      orderBy: { createdAt: "asc" },
    });
    res.json(missions.map(serializeMission));
  });

  // Crewmates
  router.get("/crewmates", async (_req, res) => {
    const crewmates = await prisma.crewmate.findMany({ orderBy: { createdAt: "asc" } });
    res.json(crewmates.map(serializeCrewmate));
  });

  router.post("/crewmates", async (req, res) => {
    const parsed = crewmateCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatZodError(parsed.error));
    }
    try {
      const crewmate = await prisma.crewmate.create({
        data: crewmateCreateToPrisma(parsed.data),
      });
      res.status(201).json(serializeCrewmate(crewmate));
    } catch (error) {
      if (isForeignKey(error)) {
        return res.status(400).json({
          error: "validation_failed",
          details: [{ field: "ship_id", message: "Ship does not exist" }],
        });
      }
      throw error;
    }
  });

  router.get("/crewmates/:id", async (req, res) => {
    const crewmate = await prisma.crewmate.findUnique({ where: { id: req.params.id } });
    if (!crewmate) return res.status(404).json({ error: "not_found" });
    res.json(serializeCrewmate(crewmate));
  });

  router.patch("/crewmates/:id", async (req, res) => {
    const parsed = crewmateUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatZodError(parsed.error));
    }
    try {
      const crewmate = await prisma.crewmate.update({
        where: { id: req.params.id },
        data: crewmateUpdateToPrisma(parsed.data),
      });
      res.json(serializeCrewmate(crewmate));
    } catch (error) {
      if (isNotFound(error)) return res.status(404).json({ error: "not_found" });
      if (isForeignKey(error)) {
        return res.status(400).json({
          error: "validation_failed",
          details: [{ field: "ship_id", message: "Ship does not exist" }],
        });
      }
      throw error;
    }
  });

  router.delete("/crewmates/:id", async (req, res) => {
    try {
      await prisma.crewmate.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      if (isNotFound(error)) return res.status(404).json({ error: "not_found" });
      throw error;
    }
  });

  // Missions
  router.get("/missions", async (_req, res) => {
    const missions = await prisma.mission.findMany({ orderBy: { createdAt: "asc" } });
    res.json(missions.map(serializeMission));
  });

  router.post("/missions", async (req, res) => {
    const parsed = missionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatZodError(parsed.error));
    }
    try {
      const mission = await prisma.mission.create({
        data: missionCreateToPrisma(parsed.data),
      });
      res.status(201).json(serializeMission(mission));
    } catch (error) {
      if (isForeignKey(error)) {
        return res.status(400).json({
          error: "validation_failed",
          details: [{ field: "ship_id", message: "Ship does not exist" }],
        });
      }
      throw error;
    }
  });

  router.get("/missions/:id", async (req, res) => {
    const mission = await prisma.mission.findUnique({ where: { id: req.params.id } });
    if (!mission) return res.status(404).json({ error: "not_found" });
    res.json(serializeMission(mission));
  });

  router.patch("/missions/:id", async (req, res) => {
    const parsed = missionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatZodError(parsed.error));
    }
    try {
      const mission = await prisma.mission.update({
        where: { id: req.params.id },
        data: missionUpdateToPrisma(parsed.data),
      });
      res.json(serializeMission(mission));
    } catch (error) {
      if (isNotFound(error)) return res.status(404).json({ error: "not_found" });
      if (isForeignKey(error)) {
        return res.status(400).json({
          error: "validation_failed",
          details: [{ field: "ship_id", message: "Ship does not exist" }],
        });
      }
      throw error;
    }
  });

  router.delete("/missions/:id", async (req, res) => {
    try {
      await prisma.mission.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      if (isNotFound(error)) return res.status(404).json({ error: "not_found" });
      throw error;
    }
  });

  return router;
}
