"use client";

import { useEffect, useRef } from "react";
import WidgetContainer from "./WidgetContainer";
import { FPSCounter } from "@/components/fpscounter";

interface Props {
  flushCount: number;
}

const PerformanceStatsWidget = ({ flushCount }: Props) => {
    const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
  });

  return (
    <WidgetContainer title="Performance">
      <p className="text-sm text-muted-foreground">
        FPS: <FPSCounter />
      </p>
      <p className="text-sm text-muted-foreground">
        Dashboard renders: {renderCount.current}
      </p>
      <p className="text-sm text-muted-foreground">
        Batch flushes: {flushCount}
      </p>
    </WidgetContainer>
  );
};

export default PerformanceStatsWidget;
