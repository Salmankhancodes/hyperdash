"use client";

import { useMemo } from "react";
import useEventStore from "@/store/useEventStore";

export default function DrillDownModal() {
  const drillWindow = useEventStore((s) => s.drillWindow);
  const snapshot = useEventStore((s) => s.snapshot);
  const endDrill = useEventStore((s) => s.endDrill);

  // Lazily filter events from snapshot buffer within the drill time window
  const filteredEvents = useMemo(() => {
    if (!drillWindow || !snapshot) return [];
    return snapshot.eventsBuffer.filter(
      (e) => e.timestamp >= drillWindow.start && e.timestamp <= drillWindow.end
    );
  }, [drillWindow, snapshot]);

  if (!drillWindow || !snapshot) return null;

  const windowStart = new Date(drillWindow.start).toLocaleTimeString();
  const windowEnd = new Date(drillWindow.end).toLocaleTimeString();
  const durationMs = drillWindow.end - drillWindow.start;

  const workerCount = filteredEvents.filter((e) => e.source === "worker").length;
  const mainCount = filteredEvents.filter((e) => e.source === "main-thread").length;
  const avgValue =
    filteredEvents.length > 0
      ? Math.round(
          filteredEvents.reduce((sum, e) => sum + e.value, 0) /
            filteredEvents.length
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-sm font-semibold">Drill-Down</h2>
            <p className="text-xs text-muted-foreground">
              {windowStart} → {windowEnd} ({durationMs}ms window)
            </p>
          </div>
          <button
            onClick={endDrill}
            className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
          >
            Close & Resume ▶
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4">
          {/* Summary metrics */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Window Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="Events in Window" value={filteredEvents.length} />
              <MetricRow label="Avg Value" value={avgValue} />
              <MetricRow label="Worker Events" value={workerCount} />
              <MetricRow label="Main Thread Events" value={mainCount} />
            </div>
          </section>

          {/* Source split bar */}
          {filteredEvents.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Source Split
              </h3>
              <div className="flex h-3 rounded overflow-hidden">
                {workerCount > 0 && (
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(workerCount / filteredEvents.length) * 100}%`,
                    }}
                  />
                )}
                {mainCount > 0 && (
                  <div
                    className="bg-amber-500"
                    style={{
                      width: `${(mainCount / filteredEvents.length) * 100}%`,
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>⚡ Worker: {workerCount}</span>
                <span>🔄 Main: {mainCount}</span>
              </div>
            </section>
          )}

          {/* Event rows */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Events ({filteredEvents.length})
            </h3>
            <div className="border rounded max-h-48 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 px-3 py-1.5 bg-card text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-10 border-b">
                <div>Time</div>
                <div>Value</div>
                <div>Source</div>
              </div>
              {filteredEvents.length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                  No events in this window
                </div>
              ) : (
                filteredEvents.map((e, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-2 px-3 py-1 text-xs text-muted-foreground border-t"
                  >
                    <div>{new Date(e.timestamp).toLocaleTimeString()}</div>
                    <div>{e.value}</div>
                    <div>{e.source === "worker" ? "Worker" : "Main"}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-muted/30 rounded px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
