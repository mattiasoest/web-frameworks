import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { JsonPanel } from "../components/JsonPanel";
import { ResourceTable } from "../components/ResourceTable";
import { useBackend } from "../context/useBackend";
import { SHIP_CLASSES, type Ship, type ShipClass, type ShipCreate } from "../types/api";
import { formatApiError } from "../utils/errors";

const defaultForm: ShipCreate = {
  name: "",
  class: "cruiser",
  registry: "",
  warp_capable: false,
};

export function ShipsPage() {
  const { api, backendId } = useBackend();
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ShipCreate>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState<unknown>(null);

  const loadShips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listShips();
      setShips(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadShips();
  }, [loadShips, backendId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createShip(form);
      setLastResponse(created);
      setForm(defaultForm);
      await loadShips();
    } catch (err) {
      setError(formatApiError(err));
      setLastResponse(err instanceof Error ? { error: err.message } : err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <ResourceTable
        title="Ships"
        rows={ships}
        loading={loading}
        error={error}
        getRowKey={(ship) => ship.id}
        columns={[
          { header: "Name", render: (ship) => <Link to={`/ships/${ship.id}`}>{ship.name}</Link> },
          { header: "Class", render: (ship) => ship.class },
          { header: "Registry", render: (ship) => ship.registry },
          { header: "Warp", render: (ship) => (ship.warp_capable ? "yes" : "no") },
        ]}
      />

      <section className="form-section">
        <h2>Create Ship</h2>
        <form onSubmit={(e) => void handleCreate(e)} className="form-grid">
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Class
            <select
              value={form.class}
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
              required
              value={form.registry}
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
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Ship"}
          </button>
        </form>
      </section>

      <JsonPanel title="Last API response" data={lastResponse} />
    </div>
  );
}
