"use client";

import WidgetContainer from "./WidgetContainer";
import useEventStore, { type Baseline } from "@/store/useEventStore";

/** Render a delta indicator: green ↑ for improvements, red ↓ for regressions. */
function Delta({
  current,
  baseline,
  higherIsBetter,
  unit = "",
}: {
  current: number;
  baseline: number;
  higherIsBetter: boolean;
  unit?: string;
}) {
  if (baseline === 0 && current === 0) return null;

  const diff = current - baseline;
  const pct = baseline !== 0 ? Math.round((diff / baseline) * 100) : 0;
  const improved = higherIsBetter ? diff > 0 : diff < 0;
  const neutral = diff === 0;

  const color = neutral
    ? "text-muted-foreground"
    : improved
      ? "text-green-600 dark:text-green-400"
      : "text-red-500 dark:text-red-400";

  const arrow = neutral ? "→" : improved ? "↑" : "↓";

  return (
    <span className={`text-xs font-medium ${color}`}>
      {arrow} {diff > 0 ? "+" : ""}
      {diff.toLocaleString(undefined, { maximumFractionDigits: 1 })}
      {unit} ({pct > 0 ? "+" : ""}
      {pct}%)
    </span>
  );
}

/** Single metric row in the comparison table. */
function MetricRow({
  label,
  tooltip,
  baselineVal,
  currentVal,
  higherIsBetter,
  unit = "",
  format,
}: {
  label: string;
  tooltip: string;
  baselineVal: number;
  currentVal: number;
  higherIsBetter: boolean;
  unit?: string;
  format?: (v: number) => string;
}) {
  const fmt = format ?? ((v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 }));
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center py-2 border-b border-border/50 last:border-b-0">
      <div>
        <span className="text-xs font-medium" title={tooltip}>{label}</span>
      </div>
      <span className="text-xs text-muted-foreground tabular-nums text-right min-w-15">
        {fmt(baselineVal)}{unit}
      </span>
      <span className="text-sm font-semibold tabular-nums text-right min-w-15">
        {fmt(currentVal)}{unit}
      </span>
      <div className="min-w-25 text-right">
        <Delta current={currentVal} baseline={baselineVal} higherIsBetter={higherIsBetter} unit={unit} />
      </div>
    </div>
  );
}

const ComparisonWidget = () => {
  const baseline = useEventStore((s) => s.baseline);
  const fps = useEventStore((s) => s.fps);
  const throughput = useEventStore((s) => s.eventThisSec);
  const droppedEvents = useEventStore((s) => s.droppedEvents);
  const avgProcessingMs = useEventStore((s) => s.avgProcessingMs);
  const flushCount = useEventStore((s) => s.flushCount);
  const workerEnabled = useEventStore((s) => s.workerEnabled);

  if (!baseline) {
    return (
      <WidgetContainer
        title="Performance Comparison"
        footer="Captures a snapshot of current metrics as a reference point, then measures the impact of toggling Worker mode."
      >
        <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No baseline captured yet.
          </p>
          <p className="text-xs text-muted-foreground max-w-70">
            Use <strong>Capture Baseline</strong> in the control panel, then toggle <strong>Web Worker</strong> to see the performance difference.
          </p>
        </div>
      </WidgetContainer>
    );
  }

  const baselineModeLabel = baseline.workerEnabled ? "Worker ON" : "Worker OFF";
  const currentModeLabel = workerEnabled ? "Worker ON" : "Worker OFF";
  const sameMode = baseline.workerEnabled === workerEnabled;

  return (
    <WidgetContainer
      title="Performance Comparison"
      footer="Baseline vs live metrics. Toggle Worker mode to see the impact on FPS, throughput, and processing latency."
    >
      <div className="space-y-3">
        {/* Header: baseline vs current mode labels */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              Baseline: {baselineModeLabel}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${
              workerEnabled
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
            }`}>
              Live: {currentModeLabel}
            </span>
          </div>
        </div>

        {sameMode && (
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 rounded px-2 py-1">
            Baseline and current use the same processing mode — toggle Worker to see a meaningful comparison.
          </p>
        )}

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b pb-1">
          <span>Metric</span>
          <span className="text-right min-w-15">Baseline</span>
          <span className="text-right min-w-15">Live</span>
          <span className="text-right min-w-25">Delta</span>
        </div>

        {/* Metric rows */}
        <MetricRow
          label="FPS"
          tooltip="Frames per second on main thread. Higher = smoother UI. Worker offloading protects this."
          baselineVal={baseline.fps}
          currentVal={fps}
          higherIsBetter={true}
        />
        <MetricRow
          label="Throughput"
          tooltip="Events processed per second. Higher = more data flowing through the pipeline."
          baselineVal={baseline.throughput}
          currentVal={throughput}
          higherIsBetter={true}
          unit=" evt/s"
        />
        <MetricRow
          label="Avg Processing"
          tooltip="Average wall-clock time per computeData() call. Lower = less thread blocking."
          baselineVal={baseline.avgProcessingMs}
          currentVal={avgProcessingMs}
          higherIsBetter={false}
          unit=" ms"
        />
        <MetricRow
          label="Dropped Events"
          tooltip="Events discarded to preserve UI responsiveness under extreme load."
          baselineVal={baseline.droppedEvents}
          currentVal={droppedEvents}
          higherIsBetter={false}
        />
        <MetricRow
          label="Flush Count"
          tooltip="Total batch flushes. Each flush commits buffered events to the UI — more flushes = more render cycles."
          baselineVal={baseline.flushCount}
          currentVal={flushCount}
          higherIsBetter={true}
        />
      </div>
    </WidgetContainer>
  );
};

export default ComparisonWidget;
