import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { JsonPanel } from "../components/JsonPanel";
import { useBackend } from "../context/useBackend";
import {
  CREWMATE_ROLES,
  type Crewmate,
  type CrewmateRole,
  type CrewmateUpdate,
  type Ship,
} from "../types/api";
import { formatApiError } from "../utils/errors";

export function CrewmateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { api, backendId } = useBackend();
  const [crewmate, setCrewmate] = useState<Crewmate | null>(null);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CrewmateUpdate>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState<unknown>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [crewmateData, shipData] = await Promise.all([api.getCrewmate(id), api.listShips()]);
      setCrewmate(crewmateData);
      setShips(shipData);
      setForm({
        ship_id: crewmateData.ship_id,
        name: crewmateData.name,
        role: crewmateData.role,
        species: crewmateData.species,
        rank: crewmateData.rank,
      });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    void loadData();
  }, [loadData, backendId]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await api.updateCrewmate(id, form);
      setLastResponse(updated);
      setCrewmate(updated);
    } catch (err) {
      setError(formatApiError(err));
      setLastResponse(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this crewmate?")) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.deleteCrewmate(id);
      navigate("/crewmates");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="status">Loading crewmate…</p>;
  if (!crewmate) return <p className="error">{error ?? "Crewmate not found."}</p>;

  return (
    <div className="page">
      <p>
        <Link to="/crewmates">← Back to crewmates</Link>
      </p>
      <h2>{crewmate.name}</h2>
      {error && <p className="error">{error}</p>}

      <section className="form-section">
        <form onSubmit={(e) => void handleUpdate(e)} className="form-grid">
          <label>
            Ship
            <select
              value={form.ship_id ?? ""}
              onChange={(e) => setForm({ ...form, ship_id: e.target.value })}
            >
              {ships.map((ship) => (
                <option key={ship.id} value={ship.id}>
                  {ship.name} ({ship.registry})
                </option>
              ))}
            </select>
          </label>
          <label>
            Name
            <input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Role
            <select
              value={form.role ?? "captain"}
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
              value={form.species ?? ""}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
            />
          </label>
          <label>
            Rank
            <input
              type="number"
              min={1}
              value={form.rank ?? 1}
              onChange={(e) => setForm({ ...form, rank: Number(e.target.value) })}
            />
          </label>
          <div className="button-row">
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Update Crewmate"}
            </button>
            <button type="button" className="btn-danger" disabled={submitting} onClick={() => void handleDelete()}>
              Delete Crewmate
            </button>
          </div>
        </form>
      </section>

      <JsonPanel title="Crewmate JSON" data={crewmate} />
      <JsonPanel title="Last API response" data={lastResponse} />
    </div>
  );
}
