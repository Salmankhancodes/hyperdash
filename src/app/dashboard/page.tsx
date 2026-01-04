"use client"
import { FPSCounter } from "@/components/fpscounter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EventStatsWidget from "@/components/widgets/EventStatsWidget";
import LiveChartWidget from "@/components/widgets/LiveChartWidget";
import LogWidget from "@/components/widgets/LogWidget";
import PerformanceStatsWidget from "@/components/widgets/PerformanceStatsWidget";
import { computeData } from "@/lib/utils";
import useEventStore from "@/store/useEventStore";
import { useEffect, useRef } from "react";
export default function DashboardPage() {
  const workerRef = useRef<Worker | null>(null);
  const bufferedTotalRef = useRef(0);
  const mainThreadArrRef = useRef<number[]>([]);
  const flushCount = useRef(0);
  const {
    setEventThisSec,
    incrementTotalEvents,
    pushEvents,
    workerEnabled,
    batchInterval
  } = useEventStore();

  /**
 * generate event
 * for every generated event
 * - update current event in store - 1
 * - process data based on worker toggle
 * - update buffer refrence - 2
 * clean event generator
 */

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvents = Math.floor(Math.random() * 16) + 5; // 5–20
      setEventThisSec(newEvents);
      if (workerEnabled) {
        workerRef.current?.postMessage(newEvents);
      }
      else {
        const computedValue = computeData(newEvents, mainThreadArrRef.current)
        bufferedTotalRef.current += newEvents;
      }
    }, 500); // 10 updates/sec

    return () => clearInterval(interval);

  }, []);
  /**
   * init worker
   * when worker done with processing set of data add it to buffer refrence - 2
   * worker processing may not run if worker toggle is false
   * clean up worker
   */
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../workers/eventWorkers.ts", import.meta.url)
    );

    workerRef.current.onmessage = (e) => {
      const { processed } = e.data;
      bufferedTotalRef.current += processed;
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  /**
   * init buffer
   * if buffer value is > 0 update store these event, and calc total events, reset buffer
   * clean buffer
   */
  useEffect(() => {
    const flushInterval = setInterval(() => {
      const value = bufferedTotalRef.current;
      if (value > 0) {
        flushCount.current += 1;
        incrementTotalEvents(value);
        pushEvents(value);
        bufferedTotalRef.current = 0;
      }
    }, batchInterval); // batching window

    return () => clearInterval(flushInterval);
  }, [batchInterval]);


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    <EventStatsWidget />
      <PerformanceStatsWidget flushCount={flushCount.current} />
      <LiveChartWidget />
      <LogWidget />
    </div>
  );
}