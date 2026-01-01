"use client";

import { useEffect, useRef } from "react";
import useEventStore from "@/store/useEventStore";
import { computeData } from "@/lib/utils";

export function useEventEngine() {
  const workerRef = useRef<Worker | null>(null);
  const bufferedTotalRef = useRef(0);

  const {
    setEventThisSec,
    incrementTotalEvents,
    pushEvents,
    workerEnabled,
    batchInterval,
    incrementFlushCount
  } = useEventStore();

  // init worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/eventWorkers.ts", import.meta.url)
    );

    workerRef.current.onmessage = (e) => {
      bufferedTotalRef.current += e.data.processed;
    };

    return () => workerRef.current?.terminate();
  }, []);

  // event generation
  useEffect(() => {
    const interval = setInterval(() => {
      const events = Math.floor(Math.random() * 16) + 5;
      setEventThisSec(events);

      if (workerEnabled) {
        workerRef.current?.postMessage(events);
      } else {
        computeData(events, []);
        bufferedTotalRef.current += events;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [workerEnabled]);

  // batch flush
  useEffect(() => {
    const flush = setInterval(() => {
      const value = bufferedTotalRef.current;
      if (value > 0) {
        incrementFlushCount();
        incrementTotalEvents(value);
        pushEvents(value);
        bufferedTotalRef.current = 0;
      }
    }, batchInterval);

    return () => clearInterval(flush);
  }, [batchInterval]);
}
