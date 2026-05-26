import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { JsonPanel } from "../components/JsonPanel";
import { ResourceTable } from "../components/ResourceTable";
import { useBackend } from "../context/useBackend";
import {
  MISSION_STATUSES,
  type Mission,
  type MissionCreate,
  type MissionStatus,
  type Ship,
} from "../types/api";
import { formatApiError } from "../utils/errors";

const defaultForm: MissionCreate = {
  ship_id: "",
  codename: "",
  objective: "",
  status: "planned",
};

export function MissionsPage() {
  const { api, backendId } = useBackend();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MissionCreate>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState<unknown>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [missionData, shipData] = await Promise.all([api.listMissions(), api.listShips()]);
      setMissions(missionData);
      setShips(shipData);
      setForm((prev) => (prev.ship_id ? prev : { ...prev, ship_id: shipData[0]?.id ?? "" }));
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadData();
  }, [loadData, backendId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createMission(form);
      setLastResponse(created);
      setForm((prev) => ({ ...defaultForm, ship_id: prev.ship_id }));
      await loadData();
    } catch (err) {
      setError(formatApiError(err));
      setLastResponse(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <ResourceTable
        title="Missions"
        rows={missions}
        loading={loading}
        error={error}
        getRowKey={(m) => m.id}
        columns={[
          { header: "Codename", render: (m) => <Link to={`/missions/${m.id}`}>{m.codename}</Link> },
          { header: "Status", render: (m) => m.status },
          { header: "Objective", render: (m) => m.objective },
          { header: "Ship", render: (m) => <Link to={`/ships/${m.ship_id}`}>{m.ship_id.slice(0, 8)}…</Link> },
        ]}
      />

      <section className="form-section">
        <h2>Create Mission</h2>
        <form onSubmit={(e) => void handleCreate(e)} className="form-grid">
          <label>
            Ship
            <select
              required
              value={form.ship_id}
              onChange={(e) => setForm({ ...form, ship_id: e.target.value })}
            >
              <option value="">Select ship…</option>
              {ships.map((ship) => (
                <option key={ship.id} value={ship.id}>
                  {ship.name} ({ship.registry})
                </option>
              ))}
            </select>
          </label>
          <label>
            Codename
            <input
              required
              value={form.codename}
              onChange={(e) => setForm({ ...form, codename: e.target.value })}
            />
          </label>
          <label>
            Objective
            <input
              required
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
            />
          </label>
          <label>
            Status
            <select
              value={form.status ?? "planned"}
              onChange={(e) => setForm({ ...form, status: e.target.value as MissionStatus })}
            >
              {MISSION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Mission"}
          </button>
        </form>
      </section>

      <JsonPanel title="Last API response" data={lastResponse} />
    </div>
  );
}
