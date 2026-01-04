"use client"

import WidgetContainer from "./WidgetContainer"
import useEventStore from "@/store/useEventStore"
import { useEffect, useRef, useState } from "react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

const LiveChartWidget = () => {
  const renderBufferRef = useRef<number[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const eventsBuffer = useEventStore((s) => s.eventsBuffer);
  useEffect(() => {
    const interval = setInterval(() => {
const MAX_POINTS = 200;

setChartData(prev =>
  [...prev, ...renderBufferRef.current].slice(-MAX_POINTS)
);    }, 150); // redraw every 150ms ONLY

    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    renderBufferRef.current = eventsBuffer;
  }, [eventsBuffer]);

  return (
    <WidgetContainer title="Live Events Chart">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.map((v, i) => ({ x: i, y: v }))}>
            <XAxis dataKey="x" hide />
            <YAxis />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#3b82f6"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </WidgetContainer>
  )
}

export default LiveChartWidget
