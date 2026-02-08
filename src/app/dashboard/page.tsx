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

const EVENT_MULTIPLIER_MAP = {
  normal: 1,
  high: 5,
  extreme: 20,
};

const FIXED_INTERVAL = 500; // Fixed 500ms interval

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

  const degradeEnabledRef = useRef(
    useEventStore.getState().degradeEnabled
  );

  const maxEventsPerSecondRef = useRef(
    useEventStore.getState().maxEventsPerSecond
  );

  // Track events per second for degradation
  const eventsThisSecondRef = useRef(0);
  const currentSecondRef = useRef(Math.floor(Date.now() / 1000));

  // Accumulator for events/sec metric (separate from degradation tracking)
  const eventsPerSecAccumulatorRef = useRef(0);
  const lastMetricSecondRef = useRef(Math.floor(Date.now() / 1000));

  /* ---------------- store actions (stable) ---------------- */

  const setEventThisSec = useEventStore((s) => s.setEventThisSec);
  const incrementTotalEvents = useEventStore((s) => s.incrementTotalEvents);
  const pushEvents = useEventStore((s) => s.pushEvents);
  const incrementFlushCount = useEventStore((s) => s.incrementFlushCount);
  const incrementDroppedEvents = useEventStore((s) => s.incrementDroppedEvents);

  

  /* ---------------- keep refs in sync ---------------- */

  useEffect(() => {
    const unsub = useEventStore.subscribe((state) => {
      workerEnabledRef.current = state.workerEnabled;
      batchIntervalRef.current = state.batchInterval;
      eventRateRef.current = state.eventRatePreset;
      degradeEnabledRef.current = state.degradeEnabled;
      maxEventsPerSecondRef.current = state.maxEventsPerSecond;
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

    const baseEvents = Math.floor(Math.random() * 16) + 5;
    const multiplier = EVENT_MULTIPLIER_MAP[eventRateRef.current];
    const incomingEvents = baseEvents * multiplier;
    
    // Check if we're in a new second
    const now = Math.floor(Date.now() / 1000);
    if (now !== currentSecondRef.current) {
      currentSecondRef.current = now;
      eventsThisSecondRef.current = 0;
    }

    // Apply degradation logic if enabled
    let processedEvents = incomingEvents;
    let droppedCount = 0;

    if (degradeEnabledRef.current) {
      const remainingCapacity = maxEventsPerSecondRef.current - eventsThisSecondRef.current;
      
      if (remainingCapacity <= 0) {
        // Drop all events - capacity exhausted
        droppedCount = incomingEvents;
        processedEvents = 0;
      } else if (incomingEvents > remainingCapacity) {
        // Partial drop - only process what fits
        processedEvents = remainingCapacity;
        droppedCount = incomingEvents - remainingCapacity;
      }
      
      eventsThisSecondRef.current += processedEvents;
    }

    // Update dropped events counter if any were dropped
    if (droppedCount > 0) {
      incrementDroppedEvents(droppedCount);
    }
    
    // Accumulate processed events for per-second metric
    eventsPerSecAccumulatorRef.current += processedEvents;

    // Check if we've entered a new second for metrics
    const metricSecond = Math.floor(Date.now() / 1000);
    if (metricSecond !== lastMetricSecondRef.current) {
      // Publish accumulated value to store
      setEventThisSec(eventsPerSecAccumulatorRef.current);
      // Reset accumulator for new second
      eventsPerSecAccumulatorRef.current = 0;
      lastMetricSecondRef.current = metricSecond;
    }

    if (processedEvents > 0) {
      if (workerEnabledRef.current) {
        workerRef.current?.postMessage(processedEvents);
      } else {
        computeData(processedEvents, mainThreadArrRef.current);
        bufferedTotalRef.current += processedEvents;
      }
    }

    setTimeout(tick, FIXED_INTERVAL);
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
    let interval: ReturnType<typeof setInterval>;
    let previousBatchInterval = useEventStore.getState().batchInterval;

    const tick = () => {
      const value = bufferedTotalRef.current;
      if (value > 0) {
        incrementFlushCount();
        incrementTotalEvents(value);
        const source = workerEnabledRef.current ? 'worker' : 'main-thread';
        pushEvents(value, source);
        bufferedTotalRef.current = 0;
      }
    };

    const start = (ms: number) => {
      clearInterval(interval);
      console.log("Setting batch interval:", ms);
      interval = setInterval(tick, ms);
    };

    start(previousBatchInterval);

    const unsub = useEventStore.subscribe((state) => {
      if (state.batchInterval !== previousBatchInterval) {
        console.log("Batch interval changed from", previousBatchInterval, "to", state.batchInterval);
        start(state.batchInterval);
        previousBatchInterval = state.batchInterval;
      }
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
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
