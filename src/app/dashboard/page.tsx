"use client";

import { useEffect, useRef, useState } from "react";
import EventStatsWidget from "@/components/widgets/EventStatsWidget";
import LiveChartWidget from "@/components/widgets/LiveChartWidget";
import LogWidget from "@/components/widgets/LogWidget";
import PerformanceStatsWidget from "@/components/widgets/PerformanceStatsWidget";
import { computeData } from "@/lib/utils";
import useEventStore from "@/store/useEventStore";
import { useRenderCount } from "@/hooks/useRenderCount";

export default function DashboardPage() {
  useRenderCount("Dashboard page");

  /* ---------------- refs (NO RE-RENDERS) ---------------- */

  const workerRef = useRef<Worker | null>(null);
  const bufferedTotalRef = useRef(0);
  const mainThreadArrRef = useRef<number[]>([]);
  const [renderCount, setRenderCount] = useState(0);

  const workerEnabledRef = useRef(
    useEventStore.getState().workerEnabled
  );

  const batchIntervalRef = useRef(
    useEventStore.getState().batchInterval
  );

  /* ---------------- store actions (stable) ---------------- */

  const setEventThisSec = useEventStore((s) => s.setEventThisSec);
  const incrementTotalEvents = useEventStore((s) => s.incrementTotalEvents);
  const pushEvents = useEventStore((s) => s.pushEvents);
  const incrementFlushCount = useEventStore((s) => s.incrementFlushCount);
  

  /* ---------------- keep refs in sync ---------------- */

  useEffect(() => {
    const unsub = useEventStore.subscribe((state) => {
      workerEnabledRef.current = state.workerEnabled;
      batchIntervalRef.current = state.batchInterval;
    });

    return unsub;
  }, []);

  useEffect(() => {
    // setRenderCount((rc) => rc + 1);
  });

  /* ---------------- event generator ---------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvents = Math.floor(Math.random() * 16) + 5; // 5–20

      setEventThisSec(newEvents);

      if (workerEnabledRef.current) {
        workerRef.current?.postMessage(newEvents);
      } else {
        computeData(newEvents, mainThreadArrRef.current);
        bufferedTotalRef.current += newEvents;
      }
    }, 500); // 10 updates/sec

    return () => clearInterval(interval);
  }, []);

  /* ---------------- worker setup ---------------- */

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../workers/eventWorkers.ts", import.meta.url)
    );

    workerRef.current.onmessage = (e) => {
      bufferedTotalRef.current += e.data.processed;
    };

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  /* ---------------- batching flush ---------------- */

  useEffect(() => {
    const tick = () => {
      const value = bufferedTotalRef.current;
      if (value > 0) {
        incrementFlushCount();
        incrementTotalEvents(value);
        pushEvents(value);
        bufferedTotalRef.current = 0;
      }
    };

    const interval = setInterval(tick, batchIntervalRef.current);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- render ---------------- */

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <EventStatsWidget />
      <PerformanceStatsWidget renderCount={renderCount} />
      <LiveChartWidget />
      <LogWidget />
    </div>
  );
}
