"use client";

import { useEffect, useRef, useState } from "react";
import EventStatsWidget from "@/components/widgets/EventStatsWidget";
import LiveChartWidget from "@/components/widgets/LiveChartWidget";
import LogWidget from "@/components/widgets/LogWidget";
import PerformanceStatsWidget from "@/components/widgets/PerformanceStatsWidget";
import { computeData } from "@/lib/utils";
import useEventStore from "@/store/useEventStore";
import { useRenderCount } from "@/hooks/useRenderCount";
import ControlPanel  from "@/components/shell/ControlPanel";

const EVENT_RATE_MAP = {
  normal: 1000,    // 1 update/sec
  high: 500,   // 2 updates/sec
  extreme: 100,     // 10 updates/sec
};


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

  const eventRateRef = useRef(
    useEventStore.getState().eventRatePreset
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
      eventRateRef.current = state.eventRatePreset;
    });

    return unsub;
  }, []);

  useEffect(() => {
    // setRenderCount((rc) => rc + 1);
  });

  /* ---------------- event generator ---------------- */

useEffect(() => {
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;

    const newEvents = Math.floor(Math.random() * 16) + 5;
    setEventThisSec(newEvents);

    if (workerEnabledRef.current) {
      workerRef.current?.postMessage(newEvents);
    } else {
      computeData(newEvents, mainThreadArrRef.current);
      bufferedTotalRef.current += newEvents;
    }

    const delay = EVENT_RATE_MAP[eventRateRef.current];
    setTimeout(tick, delay);
  };

  tick(); // start loop

  return () => {
    cancelled = true;
  };
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
    console.log("Setting batch interval:", batchIntervalRef.current);

    const interval = setInterval(tick, batchIntervalRef.current);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- render ---------------- */

  return (
    <div className="w-full h-full px-4 md:px-6 lg:px-8 py-4 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Global Control Panel - Full Width */}
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <ControlPanel />
        </div>
        
        {/* Row 1: Observability */}
        <div className="min-h-0">
          <PerformanceStatsWidget renderCount={renderCount} />
        </div>
        
        {/* Row 2: Detailed Analysis */}
        <div className="min-h-0">
          <LiveChartWidget />
        </div>
        <div className="min-h-0">
          <EventStatsWidget />
        </div>
        <div className="min-h-0">
          <LogWidget />
        </div>
      </div>
    </div>
  );
}
