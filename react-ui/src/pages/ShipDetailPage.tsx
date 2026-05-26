import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { JsonPanel } from "../components/JsonPanel";
import { ResourceTable } from "../components/ResourceTable";
import { useBackend } from "../context/useBackend";
import {
  SHIP_CLASSES,
  type Crewmate,
  type Mission,
  type Ship,
  type ShipClass,
  type ShipUpdate,
} from "../types/api";
import { formatApiError } from "../utils/errors";

type Tab = "details" | "crewmates" | "missions";

export function ShipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { api, backendId } = useBackend();
  const [ship, setShip] = useState<Ship | null>(null);
  const [crewmates, setCrewmates] = useState<Crewmate[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tab, setTab] = useState<Tab>("details");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ShipUpdate>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState<unknown>(null);

  const loadShip = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getShip(id);
      setShip(data);
      setForm({
        name: data.name,
        class: data.class,
        registry: data.registry,
        warp_capable: data.warp_capable,
      });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  const loadCrewmates = useCallback(async () => {
    if (!id) return;
    try {
      setCrewmates(await api.listShipCrewmates(id));
    } catch (err) {
      setError(formatApiError(err));
    }
  }, [api, id]);

  const loadMissions = useCallback(async () => {
    if (!id) return;
    try {
      setMissions(await api.listShipMissions(id));
    } catch (err) {
      setError(formatApiError(err));
    }
  }, [api, id]);

  useEffect(() => {
    void loadShip();
  }, [loadShip, backendId]);

  useEffect(() => {
    if (tab === "crewmates") void loadCrewmates();
    if (tab === "missions") void loadMissions();
  }, [tab, loadCrewmates, loadMissions, backendId]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await api.updateShip(id, form);
      setLastResponse(updated);
      setShip(updated);
    } catch (err) {
      setError(formatApiError(err));
      setLastResponse(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this ship?")) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.deleteShip(id);
      navigate("/ships");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="status">Loading ship…</p>;
  if (!ship) return <p className="error">{error ?? "Ship not found."}</p>;

  return (
    <div className="page">
      <p>
        <Link to="/ships">← Back to ships</Link>
      </p>
      <h2>{ship.name}</h2>
      {error && <p className="error">{error}</p>}

      <div className="tabs">
        <button type="button" className={tab === "details" ? "active" : ""} onClick={() => setTab("details")}>
          Details
        </button>
        <button type="button" className={tab === "crewmates" ? "active" : ""} onClick={() => setTab("crewmates")}>
          Crewmates
        </button>
        <button type="button" className={tab === "missions" ? "active" : ""} onClick={() => setTab("missions")}>
          Missions
        </button>
      </div>

      {tab === "details" && (
        <section className="form-section">
          <form onSubmit={(e) => void handleUpdate(e)} className="form-grid">
            <label>
              Name
              <input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Class
              <select
                value={form.class ?? "cruiser"}
                onChange={(e) => setForm({ ...form, class: e.target.value as ShipClass })}
              >
                {SHIP_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Registry
              <input
                value={form.registry ?? ""}
                onChange={(e) => setForm({ ...form, registry: e.target.value })}
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.warp_capable ?? false}
                onChange={(e) => setForm({ ...form, warp_capable: e.target.checked })}
              />
              Warp capable
            </label>
            <div className="button-row">
              <button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Update Ship"}
              </button>
              <button type="button" className="btn-danger" disabled={submitting} onClick={() => void handleDelete()}>
                Delete Ship
              </button>
            </div>
          </form>
          <JsonPanel title="Ship JSON" data={ship} />
        </section>
      )}

      {tab === "crewmates" && (
        <ResourceTable
          title="Ship Crewmates"
          rows={crewmates}
          loading={false}
          error={null}
          getRowKey={(c) => c.id}
          columns={[
            { header: "Name", render: (c) => <Link to={`/crewmates/${c.id}`}>{c.name}</Link> },
            { header: "Role", render: (c) => c.role },
            { header: "Species", render: (c) => c.species },
            { header: "Rank", render: (c) => c.rank },
          ]}
        />
      )}

      {tab === "missions" && (
        <ResourceTable
          title="Ship Missions"
          rows={missions}
          loading={false}
          error={null}
          getRowKey={(m) => m.id}
          columns={[
            { header: "Codename", render: (m) => <Link to={`/missions/${m.id}`}>{m.codename}</Link> },
            { header: "Status", render: (m) => m.status },
            { header: "Objective", render: (m) => m.objective },
          ]}
        />
      )}

      <JsonPanel title="Last API response" data={lastResponse} />
    </div>
  );
}
