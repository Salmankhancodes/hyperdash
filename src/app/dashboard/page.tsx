"use client";

import { useEffect, useRef } from "react";
import EventStatsWidget from "@/components/widgets/EventStatsWidget";
import LiveChartWidget from "@/components/widgets/LiveChartWidget";
import LogWidget from "@/components/widgets/LogWidget";
import PerformanceStatsWidget from "@/components/widgets/PerformanceStatsWidget";
import ComparisonWidget from "@/components/widgets/ComparisonWidget";
import { computeDataTimed } from "@/lib/utils";
import useEventStore from "@/store/useEventStore";
import { useRenderCount } from "@/hooks/useRenderCount";
import ControlPanel  from "@/components/shell/ControlPanel";
import InspectModal from "@/components/shell/InspectModal";
import DrillDownModal from "@/components/shell/DrillDownModal";

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

  const workerEnabledRef = useRef(
    useEventStore.getState().workerEnabled
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

  // Pause state ref (no re-renders)
  const isPausedRef = useRef(useEventStore.getState().isPaused);
  const droppedWhilePausedRef = useRef(0);

  // Processing time tracking (rolling average)
  const processingTimesRef = useRef<number[]>([]);

  /* ---------------- store actions (stable) ---------------- */

  const setEventThisSec = useEventStore((s) => s.setEventThisSec);
  const incrementTotalEvents = useEventStore((s) => s.incrementTotalEvents);
  const pushEvents = useEventStore((s) => s.pushEvents);
  const incrementFlushCount = useEventStore((s) => s.incrementFlushCount);
  const incrementDroppedEvents = useEventStore((s) => s.incrementDroppedEvents);
  const setAvgProcessingMs = useEventStore((s) => s.setAvgProcessingMs);

  

  /* ---------------- keep refs in sync ---------------- */

  useEffect(() => {
    const unsub = useEventStore.subscribe((state) => {
      workerEnabledRef.current = state.workerEnabled;
      eventRateRef.current = state.eventRatePreset;
      degradeEnabledRef.current = state.degradeEnabled;
      maxEventsPerSecondRef.current = state.maxEventsPerSecond;
      isPausedRef.current = state.isPaused;
    });

    return unsub;
  }, []);

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
      if (isPausedRef.current) {
        droppedWhilePausedRef.current += droppedCount;
      } else {
        // Flush any drops accumulated during pause + current
        const totalDrops = droppedWhilePausedRef.current + droppedCount;
        droppedWhilePausedRef.current = 0;
        incrementDroppedEvents(totalDrops);
      }
    } else if (!isPausedRef.current && droppedWhilePausedRef.current > 0) {
      // Flush leftover drops from pause period
      incrementDroppedEvents(droppedWhilePausedRef.current);
      droppedWhilePausedRef.current = 0;
    }

    // Publish per-second metric on second boundary, then accumulate current tick
    if (now !== lastMetricSecondRef.current) {
      if (!isPausedRef.current) {
        setEventThisSec(eventsPerSecAccumulatorRef.current);

        // Publish rolling average processing time
        const times = processingTimesRef.current;
        if (times.length > 0) {
          const avg = times.reduce((a, b) => a + b, 0) / times.length;
          setAvgProcessingMs(Math.round(avg * 100) / 100);
          processingTimesRef.current = [];
        }
      }
      eventsPerSecAccumulatorRef.current = 0;
      lastMetricSecondRef.current = now;
    }
    eventsPerSecAccumulatorRef.current += processedEvents;

    if (processedEvents > 0) {
      if (workerEnabledRef.current && workerRef.current) {
        workerRef.current.postMessage(processedEvents);
      } else {
        const { durationMs } = computeDataTimed(processedEvents, mainThreadArrRef.current);
        processingTimesRef.current.push(durationMs);
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
      if (typeof e.data.durationMs === 'number') {
        processingTimesRef.current.push(e.data.durationMs);
      }
    };

    workerRef.current.onerror = (e) => {
      console.error("Worker error:", e.message);
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
      if (isPausedRef.current) return;

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
      interval = setInterval(tick, ms);
    };

    start(previousBatchInterval);

    const unsub = useEventStore.subscribe((state) => {
      if (state.batchInterval !== previousBatchInterval) {
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
    <>
    <InspectModal />
    <DrillDownModal />
    <div className="w-full h-full px-4 md:px-6 lg:px-8 py-4 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Control Panel - Full Width */}
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <ControlPanel />
        </div>
        
        {/* Row 1: Compact stat panels side-by-side */}
        <div className="min-h-0">
          <PerformanceStatsWidget />
        </div>
        <div className="min-h-0">
          <EventStatsWidget />
        </div>

        {/* Row 1 col 3 on xl, or row 2 on md: Log widget */}
        <div className="min-h-0 md:col-span-2 xl:col-span-1 xl:row-span-1">
          <LogWidget />
        </div>

        {/* Row 2: Chart gets more room */}
        <div className="min-h-0 md:col-span-2 xl:col-span-2">
          <LiveChartWidget />
        </div>

        {/* Comparison fills remaining col on xl, or full-width on md */}
        <div className="min-h-0 md:col-span-2 xl:col-span-1">
          <ComparisonWidget />
        </div>
      </div>
    </div>
    </>
  );
}
