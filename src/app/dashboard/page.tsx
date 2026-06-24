"use client";

import { useEffect, useRef } from "react";
import EventStatsWidget from "@/components/widgets/EventStatsWidget";
import LiveChartWidget from "@/components/widgets/LiveChartWidget";
import LogWidget from "@/components/widgets/LogWidget";
import PerformanceStatsWidget from "@/components/widgets/PerformanceStatsWidget";
import ComparisonWidget from "@/components/widgets/ComparisonWidget";
import { applyDegradationLimit, averageOf } from "@/lib/pipeline";
import { computeDataTimed } from "@/lib/utils";
import useEventStore, { type EventData } from "@/store/useEventStore";
import { useRenderCount } from "@/hooks/useRenderCount";
import ControlPanel  from "@/components/shell/ControlPanel";
import InspectModal from "@/components/shell/InspectModal";
import DrillDownModal from "@/components/shell/DrillDownModal";

const TICK_INTERVAL = 16; // ~60fps — high-frequency event generation

const EVENTS_PER_TICK = {
  normal: 2,     // ~125 events/sec
  high: 8,       // ~500 events/sec
  extreme: 32,   // ~2000 events/sec
};

export default function DashboardPage() {
  useRenderCount("Dashboard page");

  /* ---------------- refs (NO RE-RENDERS) ---------------- */

  const workerRef = useRef<Worker | null>(null);
  const pendingEventsRef = useRef<EventData[]>([]);
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
  const workerBusyRef = useRef(false);
  const inflightWorkerBatchRef = useRef<EventData[] | null>(null);
  const completedWhilePausedRef = useRef<{ events: EventData[]; durationMs: number }[]>([]);

  /* ---------------- store actions (stable) ---------------- */

  const setEventThisSec = useEventStore((s) => s.setEventThisSec);
  const flushBatch = useEventStore((s) => s.flushBatch);
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

  /* ---------------- event generator (high frequency) ---------------- */

  useEffect(() => {
    let cancelled = false;

    const publishSecondMetrics = (nextSecond: number) => {
      if (!isPausedRef.current) {
        setEventThisSec(eventsPerSecAccumulatorRef.current);

        const avg = averageOf(processingTimesRef.current);
        if (avg > 0) {
          setAvgProcessingMs(Math.round(avg * 100) / 100);
          processingTimesRef.current = [];
        }
      }

      eventsPerSecAccumulatorRef.current = 0;
      lastMetricSecondRef.current = nextSecond;
    };

    const tick = () => {
      if (cancelled) return;

      const now = Date.now();
      const nowSec = Math.floor(now / 1000);

      if (nowSec !== lastMetricSecondRef.current) {
        publishSecondMetrics(nowSec);
      }

      if (isPausedRef.current || (workerEnabledRef.current && workerBusyRef.current)) {
        setTimeout(tick, TICK_INTERVAL);
        return;
      }

      const eventsPerTick = EVENTS_PER_TICK[eventRateRef.current];

      // Reset degradation counter on second boundary
      if (nowSec !== currentSecondRef.current) {
        currentSecondRef.current = nowSec;
        eventsThisSecondRef.current = 0;
      }

      const { acceptedEvents, droppedEvents, nextSecondCount } = applyDegradationLimit(
        eventsPerTick,
        eventsThisSecondRef.current,
        degradeEnabledRef.current,
        maxEventsPerSecondRef.current,
      );

      eventsThisSecondRef.current = nextSecondCount;

      const source: 'worker' | 'main-thread' = workerEnabledRef.current ? 'worker' : 'main-thread';

      for (let i = 0; i < acceptedEvents; i++) {
        pendingEventsRef.current.push({
          value: Math.floor(Math.random() * 100),
          source,
          timestamp: now,
        });
      }

      // Report drops (pause-aware)
      if (droppedEvents > 0) {
        if (isPausedRef.current) {
          droppedWhilePausedRef.current += droppedEvents;
        } else {
          const totalDrops = droppedWhilePausedRef.current + droppedEvents;
          droppedWhilePausedRef.current = 0;
          incrementDroppedEvents(totalDrops);
        }
      } else if (!isPausedRef.current && droppedWhilePausedRef.current > 0) {
        incrementDroppedEvents(droppedWhilePausedRef.current);
        droppedWhilePausedRef.current = 0;
      }

      setTimeout(tick, TICK_INTERVAL);
    };

    tick();
    return () => { cancelled = true; };
  }, [incrementDroppedEvents, setAvgProcessingMs, setEventThisSec]);


  /* ---------------- worker setup ---------------- */

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../workers/eventWorkers.ts", import.meta.url)
    );

    workerRef.current.onmessage = (e) => {
      workerBusyRef.current = false;

      const completedBatch = inflightWorkerBatchRef.current;
      inflightWorkerBatchRef.current = null;

      if (!completedBatch || typeof e.data.durationMs !== 'number') {
        return;
      }

      if (isPausedRef.current) {
        completedWhilePausedRef.current.push({
          events: completedBatch,
          durationMs: e.data.durationMs,
        });
        return;
      }

      processingTimesRef.current.push(e.data.durationMs);
      eventsPerSecAccumulatorRef.current += completedBatch.length;
      flushBatch(completedBatch);
    };

    workerRef.current.onerror = (e) => {
      workerBusyRef.current = false;
      inflightWorkerBatchRef.current = null;
      console.error("Worker error:", e.message);
    };

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [flushBatch]);

  /* ---------------- batching flush ---------------- */

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let previousBatchInterval = useEventStore.getState().batchInterval;

    const commitCompletedWhilePaused = () => {
      if (completedWhilePausedRef.current.length === 0 || isPausedRef.current) {
        return;
      }

      for (const batch of completedWhilePausedRef.current) {
        processingTimesRef.current.push(batch.durationMs);
        eventsPerSecAccumulatorRef.current += batch.events.length;
        flushBatch(batch.events);
      }

      completedWhilePausedRef.current = [];
    };

    const flush = () => {
      if (isPausedRef.current) return;

      commitCompletedWhilePaused();

      if (workerEnabledRef.current && workerBusyRef.current) {
        return;
      }

      // Drain the pending events buffer
      const events = pendingEventsRef.current;
      if (events.length === 0) return;
      pendingEventsRef.current = [];

      const count = events.length;

      // Run heavy computation on the batch
      if (workerEnabledRef.current && workerRef.current) {
        workerBusyRef.current = true;
        inflightWorkerBatchRef.current = events;
        workerRef.current.postMessage(count);
      } else {
        const { durationMs } = computeDataTimed(count, mainThreadArrRef.current);
        processingTimesRef.current.push(durationMs);
        eventsPerSecAccumulatorRef.current += events.length;

        // Commit only after compute completes so displayed throughput matches processed work.
        flushBatch(events);
      }
    };

    const start = (ms: number) => {
      clearInterval(interval);
      interval = setInterval(flush, ms);
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
  }, [flushBatch]);

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
