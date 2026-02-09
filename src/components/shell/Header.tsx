"use client"

import useEventStore from "@/store/useEventStore"

const Header = () => {
  const isPaused = useEventStore(s => s.isPaused);
  const workerEnabled = useEventStore(s => s.workerEnabled);

  return (
    <header className="w-full h-12 flex items-center justify-between px-5 bg-sidebar border-b border-sidebar-border shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <span className="text-base font-bold tracking-tight text-sidebar-foreground">⚡ HyperDash</span>
        <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-medium hidden sm:inline">Performance Monitor</span>
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-3">
        {/* Processing mode */}
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
            workerEnabled
              ? "bg-green-900/50 text-green-400 border border-green-800/50"
              : "bg-amber-900/50 text-amber-400 border border-amber-800/50"
          }`}
          title={workerEnabled
            ? "Computation offloaded to Web Worker — main thread stays free for rendering"
            : "Computation runs on main thread — may impact FPS under heavy load"
          }
        >
          {workerEnabled ? "⚡ Worker" : "🔄 Main Thread"}
        </span>

        {/* Stream status */}
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isPaused
                ? "bg-amber-400"
                : "bg-green-400 animate-pulse"
            }`}
          />
          <span className={isPaused ? "text-amber-400" : "text-green-400"}>
            {isPaused ? "Paused" : "Live"}
          </span>
        </span>
      </div>
    </header>
  )
}

export default Header