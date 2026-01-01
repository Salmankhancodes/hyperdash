"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FPSCounter } from "@/components/fpscounter";
import useEventStore from "@/store/useEventStore";

export default function PerformanceStatsWidget() {
  const flushCount = useEventStore((s) => s.flushCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <div>FPS: <FPSCounter /></div>
        <div>Batch flushes: {flushCount}</div>
      </CardContent>
    </Card>
  );
}
