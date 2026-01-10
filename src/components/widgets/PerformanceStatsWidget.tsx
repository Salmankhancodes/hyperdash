"use client";

import { useEffect, useRef, useState } from "react";
import WidgetContainer from "./WidgetContainer";
import { FPSCounter } from "@/components/fpscounter";
import { useRenderCount } from "@/hooks/useRenderCount";

interface Props {
  flushCount: number;
}

const PerformanceStatsWidget = ({ flushCount }: Props) => {
    const renderCountRef = useRef(0);
    useRenderCount('performance widget')
  
  useEffect(() => {
    renderCountRef.current += 1;
  });

  return (
    <WidgetContainer title="Performance">
      <p className="text-sm text-muted-foreground">
        FPS: <FPSCounter />
      </p>
      <p className="text-sm text-muted-foreground">
        Dashboard renders: {renderCountRef.current}
      </p>
      <p className="text-sm text-muted-foreground">
        Batch flushes: {flushCount}
      </p>
    </WidgetContainer>
  );
};

export default PerformanceStatsWidget;
