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
  const flushCount = useEventStore(s => s.flushCount);

  useRenderCount('performance widget')

  return (
    <WidgetContainer title="Performance">
      <p className="text-sm text-muted-foreground">
        FPS: <FPSCounter />
      </p>
      <p className="text-sm text-muted-foreground">
        Dashboard renders: {renderCount}
      </p>
      <p className="text-sm text-muted-foreground">
        Batch flushes: {flushCount}
      </p>
    </WidgetContainer>
  );
};

export default PerformanceStatsWidget;
