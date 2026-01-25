"use client"

import { useRenderCount } from "@/hooks/useRenderCount"
import WidgetContainer from "./WidgetContainer"
import useEventStore from "@/store/useEventStore"
import { useEffect, useRef, useState } from "react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const LiveChartWidget = () => {
  useRenderCount('LiveChartWidget');
  const renderBufferRef = useRef<{ value: number; source: 'worker' | 'main-thread'; timestamp: number }[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const eventsBuffer = useEventStore((s) => s.eventsBuffer);
  useEffect(() => {
    const interval = setInterval(() => {
const MAX_POINTS = 200;

setChartData(prev =>
  [...prev, ...renderBufferRef.current.map(e => e.value)].slice(-MAX_POINTS)
);    }, 150); // redraw every 150ms ONLY

    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    renderBufferRef.current = eventsBuffer;
  }, [eventsBuffer]);

  return (
    <WidgetContainer title="Event Throughput (Rolling Window)">
      <div className="space-y-3">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.map((v, i) => ({ x: i, y: v }))}>
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
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#3b82f6"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetContainer>
  )
}

export default LiveChartWidget
