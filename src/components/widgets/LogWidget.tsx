"use client";

import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import WidgetContainer from "./WidgetContainer";
import useEventStore from "@/store/useEventStore";

const ROW_HEIGHT = 28;
const VIEWPORT_HEIGHT = 300;

export default function LogsWidget() {
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
      <div
        ref={parentRef}
        className="relative overflow-auto"
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

            return (
              <div
                key={row.key} // ✅ STABLE KEY
                className="absolute left-0 right-0 px-2 text-xs text-muted-foreground border-b"
                style={{
                  height: ROW_HEIGHT,
                  transform: `translateY(${row.start}px)`,
                }}
              >
                Event @ {new Date(event).toLocaleTimeString()}
              </div>
            );
          })}
        </div>
      </div>
    </WidgetContainer>
  );
}
