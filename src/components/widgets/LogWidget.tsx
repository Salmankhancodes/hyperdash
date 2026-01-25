"use client";

import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import WidgetContainer from "./WidgetContainer";
import useEventStore from "@/store/useEventStore";
import { useRenderCount } from "@/hooks/useRenderCount";

const ROW_HEIGHT = 32;
const VIEWPORT_HEIGHT = 300;

export default function LogsWidget() {
  useRenderCount('Logwidget')
  const parentRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const events = useEventStore((s) => s.eventsBuffer);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    useFlushSync: false,
  });

  // Detect whether user is near bottom
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const onScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      // 2 rows tolerance
      shouldAutoScrollRef.current = distanceFromBottom < ROW_HEIGHT * 2;
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll ONLY if user didn’t scroll up
  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    rowVirtualizer.scrollToIndex(events.length - 1, { align: "end" });
  }, [events.length, rowVirtualizer]);

  return (
    <WidgetContainer title="Event Logs">
      <div className="space-y-2">
        {/* Virtualization Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-medium">
            Virtualized (10k+ rows supported)
          </span>
          <span className="text-xs text-muted-foreground">
            {events.length} rows
          </span>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-3 gap-2 px-2 py-2 bg-muted/30 rounded border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div>Timestamp</div>
          <div>Event Count</div>
          <div>Source</div>
        </div>

        {/* Virtualized Log Rows */}
        <div
          ref={parentRef}
          className="relative overflow-auto border rounded"
          style={{ height: VIEWPORT_HEIGHT }}
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((row) => {
              const event = events[row.index];
              const eventTimestamp = new Date(event.timestamp).toLocaleTimeString();
              const source = event.source === 'worker' ? 'Worker' : 'Main Thread';

              return (
                <div
                  key={row.key}
                  className="absolute left-0 right-0 grid grid-cols-3 gap-2 px-2 text-xs text-muted-foreground border-b hover:bg-muted/20 transition-colors"
                  style={{
                    height: ROW_HEIGHT,
                    transform: `translateY(${row.start}px)`,
                  }}
                >
                  <div className="truncate">{eventTimestamp}</div>
                  <div className="truncate">{event.value}</div>
                  <div className="truncate text-muted-foreground/70">{source}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}
