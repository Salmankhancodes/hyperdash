"use client";

import { useEventEngine } from "@/hooks/useEventEngine";
import EventStatsWidget from "@/components/widgets/EventStatsWidget";
import PerformanceStatsWidget from "@/components/widgets/PerformanceStatsWidget";
// import LogsWidget from "@/components/widgets/LogsWidget";

export default function DashboardPage() {
  useEventEngine();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <EventStatsWidget />
      <PerformanceStatsWidget />
      {/* <LogsWidget /> */}
    </div>
  );
}