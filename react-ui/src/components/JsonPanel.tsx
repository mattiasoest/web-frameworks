interface JsonPanelProps {
  title: string;
  data: unknown;
}

export function JsonPanel({ title, data }: JsonPanelProps) {
  if (data === null || data === undefined) {
    return null;
  }

  return (
    <section className="json-panel">
      <h3>{title}</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
