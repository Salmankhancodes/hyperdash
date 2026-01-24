"use client";

import { useEffect, useRef, useState } from "react";
import WidgetContainer from "./WidgetContainer";
import { FPSCounter } from "@/components/fpscounter";
import { useRenderCount } from "@/hooks/useRenderCount";
import useEventStore from "@/store/useEventStore";

interface PerformanceStatsWidgetProps {
  renderCount: number
}

const PerformanceStatsWidget = ({renderCount}: PerformanceStatsWidgetProps) => {
  const eventThisSec = useEventStore(s => s.eventThisSec);
  const totalEvents = useEventStore(s => s.totalEvents);
  const flushCount = useEventStore(s => s.flushCount);

  useRenderCount('performance widget')

  return (
    <WidgetContainer title="Performance">
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">FPS (Main Thread)</p>
          <p className="text-lg font-semibold">
            <FPSCounter />
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Events / sec (Ingested)</p>
          <p className="text-lg font-semibold">{eventThisSec}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Events Processed</p>
          <p className="text-lg font-semibold">{totalEvents.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Batch Flush Count</p>
          <p className="text-lg font-semibold">
            {flushCount > 0 ? flushCount : (
              <span className="text-sm font-normal text-muted-foreground">
                Batch flushes begin once buffered events accumulate
              </span>
            )}
          </p>
        </div>
      </div>
    </WidgetContainer>
  );
};

export default PerformanceStatsWidget;
