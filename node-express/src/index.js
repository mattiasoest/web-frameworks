import express from "express";
import { PrismaClient } from "@prisma/client";
import { createRoutes } from "./routes.js";

const port = Number(process.env.PORT || 3001);
const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(createRoutes(prisma));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_server_error" });
});

app.listen(port, () => {
  console.log(`node-express listening on port ${port}`);
});
