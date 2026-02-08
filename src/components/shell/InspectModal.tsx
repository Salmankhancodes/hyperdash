"use client";

import useEventStore from "@/store/useEventStore";

export default function InspectModal() {
  const snapshot = useEventStore((s) => s.snapshot);
  const isPaused = useEventStore((s) => s.isPaused);
  const togglePause = useEventStore((s) => s.togglePause);

  if (!isPaused || !snapshot) return null;

  const pausedAt = new Date(snapshot.pausedAt).toLocaleTimeString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-sm font-semibold">Inspect Snapshot</h2>
            <p className="text-xs text-muted-foreground">Frozen at {pausedAt}</p>
          </div>
          <button
            onClick={togglePause}
            className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
          >
            Resume ▶
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4">
          {/* Metrics */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="Events / sec" value={snapshot.eventThisSec} />
              <MetricRow label="Total Processed" value={snapshot.totalEvents.toLocaleString()} />
              <MetricRow label="Flush Count" value={snapshot.flushCount} />
              <MetricRow label="Dropped Events" value={snapshot.droppedEvents.toLocaleString()} />
            </div>
          </section>

          {/* Config */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Configuration
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="Processing" value={snapshot.workerEnabled ? "Web Worker" : "Main Thread"} />
              <MetricRow label="Batch Interval" value={`${snapshot.batchInterval}ms`} />
              <MetricRow label="Volume Preset" value={snapshot.eventRatePreset} />
              <MetricRow label="Degradation" value={snapshot.degradeEnabled ? `On (${snapshot.maxEventsPerSecond}/s)` : "Off"} />
            </div>
          </section>

          {/* Buffer */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Buffer ({snapshot.eventsBuffer.length} events)
            </h3>
            <div className="border rounded max-h-40 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 px-3 py-1.5 bg-card text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-10 border-b">
                <div>Time</div>
                <div>Value</div>
                <div>Source</div>
              </div>
              {snapshot.eventsBuffer.slice(-50).reverse().map((e, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-2 px-3 py-1 text-xs text-muted-foreground border-t"
                >
                  <div>{new Date(e.timestamp).toLocaleTimeString()}</div>
                  <div>{e.value}</div>
                  <div>{e.source === "worker" ? "Worker" : "Main"}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted/30 rounded px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
