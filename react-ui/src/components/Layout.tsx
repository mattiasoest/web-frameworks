import { NavLink, Outlet } from "react-router-dom";
import { BACKENDS } from "../config/backends";
import { useBackend } from "../context/useBackend";
import type { BackendId } from "../config/backends";

export function Layout() {
  const { backendId, backendLabel, setBackendId, healthStatus, healthError, refreshHealth } = useBackend();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-top">
          <h1>Spaceship Crew Log</h1>
          <div className="backend-switcher">
            <label htmlFor="backend-select">Backend</label>
            <select
              id="backend-select"
              value={backendId}
              onChange={(e) => setBackendId(e.target.value as BackendId)}
            >
              {BACKENDS.map((backend) => (
                <option key={backend.id} value={backend.id}>
                  {backend.label} (:{backend.port})
                </option>
              ))}
            </select>
            <span className={`health-badge health-${healthStatus}`} title={healthError ?? undefined}>
              {healthStatus === "ok" ? "healthy" : healthStatus === "error" ? "unreachable" : "checking…"}
            </span>
            <button type="button" className="btn-secondary" onClick={() => void refreshHealth()}>
              Recheck
            </button>
          </div>
        </div>
        <p className="subtitle">
          Active stack: <strong>{backendLabel}</strong>
        </p>
        <nav className="nav">
          <NavLink to="/ships" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Ships
          </NavLink>
          <NavLink to="/crewmates" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Crewmates
          </NavLink>
          <NavLink to="/missions" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Missions
          </NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
