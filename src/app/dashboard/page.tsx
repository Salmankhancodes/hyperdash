"use client"
import { FPSCounter } from "@/components/fpscounter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useEventStore from "@/store/useEventStore";
import { useEffect, useRef } from "react";
export default function DashboardPage() {
  const workerRef = useRef<Worker | null>(null);
  const renderCount = useRef(0);
  const {
    eventThisSec,
    totalEvents,
    setEventThisSec,
    incrementTotalEvents,
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
      incrementTotalEvents(processed);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    const arr: number[] = []; // local array simulating data window

    const interval = setInterval(() => {
      const newEvents = Math.floor(Math.random() * 16) + 5; // 5–20
      setEventThisSec(newEvents);
      workerRef.current?.postMessage(newEvents);
    }, 500); // 10 updates/sec

    return () => clearInterval(interval);

  }, []);

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