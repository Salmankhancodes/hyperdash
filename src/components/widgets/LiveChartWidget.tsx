"use client"

import { useRenderCount } from "@/hooks/useRenderCount"
import { type ThroughputSample } from "@/lib/pipeline"
import WidgetContainer from "./WidgetContainer"
import useEventStore from "@/store/useEventStore"
import { useCallback, useState } from "react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const DRILL_WINDOW_MS = 2000;      // ±1s around clicked point

const LiveChartWidget = () => {
  useRenderCount('LiveChartWidget');
  const throughputHistory = useEventStore((s) => s.throughputHistory);
  const drillWindow = useEventStore((s) => s.drillWindow);
  const startDrill = useEventStore((s) => s.startDrill);
  const [frozenHistory, setFrozenHistory] = useState<ThroughputSample[] | null>(null);

  // Click handler called directly from the activeDot SVG element
  const handlePointClick = useCallback((index: number) => {
    const point = throughputHistory[index];
    if (!point) return;
    const halfWindow = DRILL_WINDOW_MS / 2;
    startDrill({
      start: point.timestamp - halfWindow,
      end: point.timestamp + halfWindow,
      source: 'chart',
    });
  }, [startDrill, throughputHistory]);

  const visibleHistory = frozenHistory ?? throughputHistory;

  const formattedData = visibleHistory.map((p, i) => ({
    x: i,
    y: p.count,
    timestamp: p.timestamp,
  }));

  return (
    <WidgetContainer title="Event Throughput (Rolling Window)">
      <div className="space-y-3">
        {!drillWindow && (
          <p className="text-xs text-muted-foreground">Hover to freeze, click a point to drill down</p>
        )}
        <div
          className="h-60 w-full"
          onMouseEnter={() => { setFrozenHistory(throughputHistory); }}
          onMouseLeave={() => { setFrozenHistory(null); }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="x"
                label={{ value: "Time", position: "insideBottomRight", offset: -5 }}
                tick={false}
              />
              <YAxis
                label={{ value: "Events", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "4px"
                }}
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as { timestamp?: number } | undefined;
                  return point?.timestamp
                    ? new Date(point.timestamp).toLocaleTimeString()
                    : "";
                }}
                formatter={(val: number | undefined) => [`${val ?? 0} events/sec`, "Processed"]}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#3b82f6"
                dot={{ r: 3, fill: "#3b82f6", cursor: "pointer" }}
                isAnimationActive={frozenHistory === null}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                activeDot={(props: any) => {
                  const { cx, cy, index } = props as { cx: number; cy: number; index: number };
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={8}
                      fill="#3b82f6"
                      stroke="#fff"
                      strokeWidth={2}
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePointClick(index);
                      }}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetContainer>
  )
}

export default LiveChartWidget
