import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { JsonPanel } from "../components/JsonPanel";
import { ResourceTable } from "../components/ResourceTable";
import { useBackend } from "../context/useBackend";
import {
  CREWMATE_ROLES,
  type Crewmate,
  type CrewmateCreate,
  type CrewmateRole,
  type Ship,
} from "../types/api";
import { formatApiError } from "../utils/errors";

const defaultForm: CrewmateCreate = {
  ship_id: "",
  name: "",
  role: "captain",
  species: "",
  rank: 1,
};

export function CrewmatesPage() {
  const { api, backendId } = useBackend();
  const [crewmates, setCrewmates] = useState<Crewmate[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CrewmateCreate>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState<unknown>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [crewmateData, shipData] = await Promise.all([api.listCrewmates(), api.listShips()]);
      setCrewmates(crewmateData);
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
      const created = await api.createCrewmate(form);
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
        title="Crewmates"
        rows={crewmates}
        loading={loading}
        error={error}
        getRowKey={(c) => c.id}
        columns={[
          { header: "Name", render: (c) => <Link to={`/crewmates/${c.id}`}>{c.name}</Link> },
          { header: "Role", render: (c) => c.role },
          { header: "Species", render: (c) => c.species },
          { header: "Rank", render: (c) => c.rank },
          { header: "Ship", render: (c) => <Link to={`/ships/${c.ship_id}`}>{c.ship_id.slice(0, 8)}…</Link> },
        ]}
      />

      <section className="form-section">
        <h2>Create Crewmate</h2>
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
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as CrewmateRole })}
            >
              {CREWMATE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            Species
            <input
              required
              value={form.species}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
            />
          </label>
          <label>
            Rank
            <input
              required
              type="number"
              min={1}
              value={form.rank}
              onChange={(e) => setForm({ ...form, rank: Number(e.target.value) })}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Crewmate"}
          </button>
        </form>
      </section>

      <JsonPanel title="Last API response" data={lastResponse} />
    </div>
  );
}
