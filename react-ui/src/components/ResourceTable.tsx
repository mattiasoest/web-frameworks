import type { ReactNode } from "react";

interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface ResourceTableProps<T> {
  title: string;
  columns: Column<T>[];
  rows: T[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
  getRowKey: (row: T) => string;
}

export function ResourceTable<T>({
  title,
  columns,
  rows,
  loading,
  error,
  emptyMessage = "No records found.",
  getRowKey,
}: ResourceTableProps<T>) {
  return (
    <section className="resource-table">
      <h2>{title}</h2>
      {loading && <p className="status">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="status">{emptyMessage}</p>}
      {!loading && !error && rows.length > 0 && (
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.header}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((col) => (
                  <td key={col.header}>{col.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
