import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { JsonPanel } from "../components/JsonPanel";
import { useBackend } from "../context/useBackend";
import {
  MISSION_STATUSES,
  type Mission,
  type MissionStatus,
  type MissionUpdate,
  type Ship,
} from "../types/api";
import { formatApiError } from "../utils/errors";

export function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { api, backendId } = useBackend();
  const [mission, setMission] = useState<Mission | null>(null);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MissionUpdate>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState<unknown>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [missionData, shipData] = await Promise.all([api.getMission(id), api.listShips()]);
      setMission(missionData);
      setShips(shipData);
      setForm({
        ship_id: missionData.ship_id,
        codename: missionData.codename,
        objective: missionData.objective,
        status: missionData.status,
        started_at: missionData.started_at,
        ended_at: missionData.ended_at,
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
      const payload: MissionUpdate = {
        ...form,
        started_at: form.started_at || null,
        ended_at: form.ended_at || null,
      };
      const updated = await api.updateMission(id, payload);
      setLastResponse(updated);
      setMission(updated);
    } catch (err) {
      setError(formatApiError(err));
      setLastResponse(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this mission?")) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.deleteMission(id);
      navigate("/missions");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="status">Loading mission…</p>;
  if (!mission) return <p className="error">{error ?? "Mission not found."}</p>;

  return (
    <div className="page">
      <p>
        <Link to="/missions">← Back to missions</Link>
      </p>
      <h2>{mission.codename}</h2>
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
            Codename
            <input
              value={form.codename ?? ""}
              onChange={(e) => setForm({ ...form, codename: e.target.value })}
            />
          </label>
          <label>
            Objective
            <input
              value={form.objective ?? ""}
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
          <label>
            Started at (ISO 8601)
            <input
              value={form.started_at ?? ""}
              onChange={(e) => setForm({ ...form, started_at: e.target.value || null })}
              placeholder="2026-01-10T08:00:00Z"
            />
          </label>
          <label>
            Ended at (ISO 8601)
            <input
              value={form.ended_at ?? ""}
              onChange={(e) => setForm({ ...form, ended_at: e.target.value || null })}
              placeholder="2026-01-15T18:00:00Z"
            />
          </label>
          <div className="button-row">
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Update Mission"}
            </button>
            <button type="button" className="btn-danger" disabled={submitting} onClick={() => void handleDelete()}>
              Delete Mission
            </button>
          </div>
        </form>
      </section>

      <JsonPanel title="Mission JSON" data={mission} />
      <JsonPanel title="Last API response" data={lastResponse} />
    </div>
  );
}
