"use client"
import { FPSCounter } from "@/components/fpscounter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeData } from "@/lib/utils";
import useEventStore from "@/store/useEventStore";
import { useEffect, useRef } from "react";
export default function DashboardPage() {
  const workerRef = useRef<Worker | null>(null);
  const renderCount = useRef(0);
  const bufferedTotalRef = useRef(0);
  const mainThreadArrRef = useRef<number[]>([]);
  const flushCount = useRef(0);
  const {
    eventThisSec,
    totalEvents,
    setEventThisSec,
    incrementTotalEvents,
    pushEvents,
    workerEnabled,
    batchInterval
  } = useEventStore();

  useEffect(() => {
    renderCount.current += 1;
  });

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

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvents = Math.floor(Math.random() * 16) + 5; // 5–20
      setEventThisSec(newEvents);
      console.log("new event value", newEvents)
      if(workerEnabled){
        workerRef.current?.postMessage(newEvents);
      }
      else {
      const computedValue = computeData(newEvents, mainThreadArrRef.current)
      bufferedTotalRef.current += newEvents;
      }
    }, 500); // 10 updates/sec

    return () => clearInterval(interval);

  }, []);

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
    <div className="p-8 space-y-6 ml-52">
      <Card>
        <CardHeader>
          <CardTitle>Event Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Events/sec: {eventThisSec}
          </p>
          <p className="text-sm text-muted-foreground">
            Total events: {totalEvents}
          </p>

        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">FPS: <FPSCounter /></p>
          <p className="text-sm text-muted-foreground">Dashboard renders: {renderCount.current}</p>
          <p className="text-sm text-muted-foreground">Batch flushes: {flushCount.current}</p>

        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}