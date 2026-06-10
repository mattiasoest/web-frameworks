export type BackendId =
  | "node-express"
  | "python-fastapi"
  | "ruby-rails"
  | "java-springboot"
  | "kotlin-springboot"
  | "go-gin"
  | "node-nestjs";

export interface Backend {
  id: BackendId;
  label: string;
  port: number;
  dockerHost: string;
}

export const BACKENDS: Backend[] = [
  { id: "node-express", label: "Node/Express", port: 3001, dockerHost: "node-express" },
  { id: "node-nestjs", label: "Node/NestJS", port: 3007, dockerHost: "node-nestjs" },
  { id: "python-fastapi", label: "Python/FastAPI", port: 3002, dockerHost: "python-fastapi" },
  { id: "ruby-rails", label: "Ruby on Rails", port: 3003, dockerHost: "ruby-rails" },
  { id: "java-springboot", label: "Java/Spring Boot", port: 3004, dockerHost: "java-springboot" },
  { id: "kotlin-springboot", label: "Kotlin/Spring Boot", port: 3005, dockerHost: "kotlin-springboot" },
  { id: "go-gin", label: "Go/Gin", port: 3006, dockerHost: "go-gin" },
];

export const DEFAULT_BACKEND_ID: BackendId = "node-express";

export function getBackend(id: BackendId): Backend {
  const backend = BACKENDS.find((b) => b.id === id);
  if (!backend) {
    throw new Error(`Unknown backend: ${id}`);
  }
  return backend;
}

export function backendBasePath(id: BackendId): string {
  return `/backends/${id}`;
}
