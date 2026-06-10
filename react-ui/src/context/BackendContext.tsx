import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createApiClient } from "../api/client";
import {
  BACKENDS,
  backendBasePath,
  DEFAULT_BACKEND_ID,
  getBackend,
  type BackendId,
} from "../config/backends";
import { BackendContext } from "./backend-context";

const STORAGE_KEY = "spaceship-backend";

const LEGACY_BACKEND_IDS: Record<string, BackendId> = {
  "typescript-nestjs": "node-nestjs",
};

function readStoredBackendId(): BackendId {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_BACKEND_ID;
  }
  const resolved = LEGACY_BACKEND_IDS[stored] ?? stored;
  if (BACKENDS.some((b) => b.id === resolved)) {
    if (resolved !== stored) {
      localStorage.setItem(STORAGE_KEY, resolved);
    }
    return resolved as BackendId;
  }
  return DEFAULT_BACKEND_ID;
}

export function BackendProvider({ children }: { children: ReactNode }) {
  const [backendId, setBackendIdState] = useState<BackendId>(readStoredBackendId);
  const [healthStatus, setHealthStatus] = useState<"unknown" | "ok" | "error">("unknown");
  const [healthError, setHealthError] = useState<string | null>(null);

  const basePath = backendBasePath(backendId);
  const api = useMemo(() => createApiClient(basePath), [basePath]);
  const backendLabel = getBackend(backendId).label;

  const refreshHealth = useCallback(async () => {
    try {
      const result = await api.healthz();
      if (result.status === "ok") {
        setHealthStatus("ok");
        setHealthError(null);
      } else {
        setHealthStatus("error");
        setHealthError(`Unexpected status: ${result.status}`);
      }
    } catch (err) {
      setHealthStatus("error");
      setHealthError(err instanceof Error ? err.message : "Health check failed");
    }
  }, [api]);

  const setBackendId = useCallback((id: BackendId) => {
    setBackendIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  useEffect(() => {
    void refreshHealth();
  }, [refreshHealth]);

  const value = useMemo(
    () => ({
      backendId,
      backendLabel,
      setBackendId,
      api,
      healthStatus,
      healthError,
      refreshHealth,
    }),
    [backendId, backendLabel, setBackendId, api, healthStatus, healthError, refreshHealth],
  );

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}
