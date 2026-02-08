"use client"

import { useRenderCount } from "@/hooks/useRenderCount"
import WidgetContainer from "./WidgetContainer"
import useEventStore from "@/store/useEventStore"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface ChartPoint {
  count: number;      // events in this bucket
  timestamp: number;  // bucket start time
}

const MAX_BUCKETS = 40;            // ~40 points = well-spaced, clickable
const BUCKET_MS = 1000;            // 1 second per bucket
const DRILL_WINDOW_MS = 2000;      // ±1s around clicked point

const LiveChartWidget = () => {
  useRenderCount('LiveChartWidget');
  const renderBufferRef = useRef<{ value: number; source: 'worker' | 'main-thread'; timestamp: number }[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const eventsBuffer = useEventStore((s) => s.eventsBuffer);
  const drillWindow = useEventStore((s) => s.drillWindow);
  const startDrill = useEventStore((s) => s.startDrill);

  // Freeze chart updates while mouse is inside (so user can click)
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isHoveringRef.current) return;

      setChartData(prev => {
        const buffer = renderBufferRef.current;
        if (buffer.length === 0) return prev;

        // Aggregate events into 1-second buckets
        const bucketMap = new Map<number, number>();

        // Carry forward existing buckets
        for (const pt of prev) {
          bucketMap.set(pt.timestamp, pt.count);
        }

        // Add new events from buffer into buckets
        for (const e of buffer) {
          const bucketKey = Math.floor(e.timestamp / BUCKET_MS) * BUCKET_MS;
          bucketMap.set(bucketKey, (bucketMap.get(bucketKey) ?? 0) + 1);
        }

        // Sort by timestamp, keep last N buckets
        const sorted = Array.from(bucketMap.entries())
          .sort((a, b) => a[0] - b[0])
          .slice(-MAX_BUCKETS)
          .map(([timestamp, count]) => ({ timestamp, count }));

        return sorted;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    renderBufferRef.current = eventsBuffer;
  }, [eventsBuffer]);

  // Click handler called directly from the activeDot SVG element
  const handlePointClick = useCallback((index: number) => {
    const point = chartData[index];
    if (!point) return;
    const halfWindow = DRILL_WINDOW_MS / 2;
    startDrill({
      start: point.timestamp - halfWindow,
      end: point.timestamp + halfWindow,
      source: 'chart',
    });
  }, [chartData, startDrill]);

  const formattedData = chartData.map((p, i) => ({
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
          className="h-[240px] w-full"
          onMouseEnter={() => { isHoveringRef.current = true; }}
          onMouseLeave={() => { isHoveringRef.current = false; }}
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
                labelFormatter={() => ""}
                formatter={(val: number | undefined) => [`${val ?? 0} events`, "Throughput"]}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#3b82f6"
                dot={{ r: 3, fill: "#3b82f6", cursor: "pointer" }}
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
