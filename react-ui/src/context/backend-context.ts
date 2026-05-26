import { createContext } from "react";
import type { ApiClient } from "../api/client";
import type { BackendId } from "../config/backends";

export interface BackendContextValue {
  backendId: BackendId;
  backendLabel: string;
  setBackendId: (id: BackendId) => void;
  api: ApiClient;
  healthStatus: "unknown" | "ok" | "error";
  healthError: string | null;
  refreshHealth: () => Promise<void>;
}

export const BackendContext = createContext<BackendContextValue | null>(null);
