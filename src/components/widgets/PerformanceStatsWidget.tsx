"use client";

import WidgetContainer from "./WidgetContainer";
import { FPSCounter } from "@/components/fpscounter";
import { useRenderCount } from "@/hooks/useRenderCount";
import useEventStore from "@/store/useEventStore";

const PerformanceStatsWidget = () => {
  const flushCount = useEventStore(s => s.flushCount);
  const workerEnabled = useEventStore(s => s.workerEnabled);
  const droppedEvents = useEventStore(s => s.droppedEvents);
  const degradeEnabled = useEventStore(s => s.degradeEnabled);

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
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Batch Flush Count</p>
          <p className="text-lg font-semibold">
            {flushCount > 0 ? flushCount : (
              <span className="text-sm font-normal text-muted-foreground">
                Batch flushes begin once buffered events accumulate
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Dropped Events</p>
          <p className="text-lg font-semibold">
            <span className={droppedEvents > 0 ? "text-amber-600 dark:text-amber-400" : ""}>
              {droppedEvents.toLocaleString()}
            </span>
            {!degradeEnabled && (
              <span className="text-xs font-normal text-muted-foreground ml-2">(off)</span>
            )}
          </p>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Processing Mode</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              workerEnabled 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
            }`}>
              {workerEnabled ? '⚡ Web Worker' : '🔄 Main Thread'}
            </span>
            <span className="text-xs text-muted-foreground">
              {workerEnabled ? 'Offloaded' : 'Processing locally'}
            </span>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
};

export default PerformanceStatsWidget;
