type ProductMockProps = {
  compact?: boolean;
};

const runtimes = [
  { label: "Codex", state: "Attached", detail: "2 active sessions" },
  { label: "OpenClaw", state: "Healthy", detail: "Workspace-bound runtime" },
  { label: "Extensions", state: "Trusted", detail: "Exact-target assignments" }
];

const events = [
  "runtime.scan.completed",
  "chat.route.target_selected",
  "telemetry.slice.updated",
  "history.replay.prefilled"
];

export function ProductMock({ compact = false }: ProductMockProps) {
  return (
    <div className={`product-mock${compact ? " product-mock--compact" : ""}`}>
      <div className="product-mock__sidebar">
        <div>
          <p className="mini-label">Runtime inventory</p>
          <p className="product-mock__headline">Live targets</p>
        </div>

        <div className="runtime-list">
          {runtimes.map((runtime) => (
            <div className="runtime-list__item" key={runtime.label}>
              <div>
                <p>{runtime.label}</p>
                <span>{runtime.detail}</span>
              </div>
              <strong>{runtime.state}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="product-mock__main">
        <div className="product-mock__row">
          <div className="telemetry-panel">
            <p className="mini-label">Telemetry</p>
            <div className="telemetry-bars">
              <span style={{ width: "88%" }} />
              <span style={{ width: "56%" }} />
              <span style={{ width: "71%" }} />
            </div>
          </div>

          <div className="stat-cluster">
            <div>
              <span className="mini-label">Unread activity</span>
              <strong>14</strong>
            </div>
            <div>
              <span className="mini-label">Redacted export</span>
              <strong>Ready</strong>
            </div>
          </div>
        </div>

        <div className="event-stream">
          <p className="mini-label">Structured event stream</p>
          {events.map((event, index) => (
            <div className="event-stream__row" key={event}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{event}</p>
              <strong>{index === 0 ? "fresh" : "persisted"}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
