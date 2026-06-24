"use client"
// ControlPanel.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useEventStore from "@/store/useEventStore"

function ControlPanel() {

  const workerEnabled = useEventStore(s => s.workerEnabled);
  const batchInterval = useEventStore(s => s.batchInterval);
  const eventRatePreset = useEventStore(s => s.eventRatePreset);
  const degradeEnabled = useEventStore(s => s.degradeEnabled);
  const maxEventsPerSecond = useEventStore(s => s.maxEventsPerSecond);
  const setWorkerEnabled = useEventStore(s => s.toggleWorker);
  const setBatchInterval = useEventStore(s => s.setBatchInterval);
  const setEventRatePreset = useEventStore(s => s.setEventRatePreset);
  const toggleDegrade = useEventStore(s => s.toggleDegrade);
  const setMaxEventsPerSecond = useEventStore(s => s.setMaxEventsPerSecond);
  const isPaused = useEventStore(s => s.isPaused);
  const togglePause = useEventStore(s => s.togglePause);
  const baseline = useEventStore(s => s.baseline);
  const captureBaseline = useEventStore(s => s.captureBaseline);
  const clearBaseline = useEventStore(s => s.clearBaseline);

  return (
    <Card className="mb-4">
      <CardContent className="py-4 space-y-4">
        {/* Row 1: Toggle controls — evenly spaced grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Pause / Resume Toggle */}
          <div className="flex flex-col gap-2 rounded-md border border-border/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Stream Control</span>
                <span className="text-xs text-muted-foreground">Freeze UI while data flows</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isPaused}
                  onCheckedChange={togglePause}
                />
                <span className={`text-xs font-medium min-w-14 ${isPaused ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                  {isPaused ? "⏸ Paused" : "▶ Live"}
                </span>
              </div>
            </div>
            {isPaused && (
              <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded font-medium w-fit">
                Inspecting snapshot
              </span>
            )}
          </div>

          {/* Worker Toggle */}
          <div className="flex flex-col gap-2 rounded-md border border-border/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Web Worker</span>
                <span className="text-xs text-muted-foreground">Offload computation from main thread</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={workerEnabled}
                  onCheckedChange={setWorkerEnabled}
                />
                <span className="text-xs font-medium text-muted-foreground min-w-14">
                  {workerEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Graceful Degradation */}
          <div className="flex flex-col gap-2 rounded-md border border-border/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Degradation</span>
                <span className="text-xs text-muted-foreground">Drop excess events for UI stability</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={degradeEnabled}
                  onCheckedChange={toggleDegrade}
                />
                <span className="text-xs font-medium text-muted-foreground min-w-14">
                  {degradeEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Baseline */}
          <div className="flex flex-col gap-2 rounded-md border border-border/50 p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Performance Baseline</span>
              <span className="text-xs text-muted-foreground">
                {baseline
                  ? `Worker ${baseline.workerEnabled ? "ON" : "OFF"} · ${baseline.eventRatePreset} load`
                  : "Snapshot metrics, then toggle Worker"}
              </span>
            </div>
            {baseline ? (
              <Button variant="outline" size="sm" onClick={clearBaseline} className="w-fit">
                ✕ Clear Baseline
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={captureBaseline} className="w-fit">
                📸 Capture Baseline
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Dropdowns — evenly spaced grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Batch Interval */}
          <div className="flex flex-col gap-1.5 rounded-md border border-border/50 p-3">
            <span className="text-sm font-semibold">Batch Flush Interval</span>
            <span className="text-xs text-muted-foreground">How often buffered events commit to UI</span>
            <Select
              value={String(batchInterval)}
              onValueChange={value => setBatchInterval(Number(value))}
            >
              <SelectTrigger className="w-full mt-1" aria-label="Batch Flush Interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 ms</SelectItem>
                <SelectItem value="500">500 ms</SelectItem>
                <SelectItem value="1000">1000 ms</SelectItem>
                <SelectItem value="2000">2000 ms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event Rate */}
          <div className="flex flex-col gap-1.5 rounded-md border border-border/50 p-3">
            <span className="text-sm font-semibold">Event Volume</span>
            <span className="text-xs text-muted-foreground">Stress-test with higher event pressure</span>
            <Select
              value={eventRatePreset}
              onValueChange={value =>
                setEventRatePreset(value as "normal" | "high" | "extreme")
              }
            >
              <SelectTrigger className="w-full mt-1" aria-label="Event Volume">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="normal">Normal (~125/sec)</SelectItem>
              <SelectItem value="high">High (~500/sec)</SelectItem>
              <SelectItem value="extreme">Extreme (~2000/sec)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Events Per Second */}
          <div className="flex flex-col gap-1.5 rounded-md border border-border/50 p-3">
            <span className="text-sm font-semibold">Max Events/Second</span>
            <span className="text-xs text-muted-foreground">Drop threshold when degradation is on</span>
            <Select
              value={String(maxEventsPerSecond)}
              onValueChange={value => setMaxEventsPerSecond(Number(value))}
            >
              <SelectTrigger className="w-full mt-1" aria-label="Max Events Per Second">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50/sec</SelectItem>
                <SelectItem value="100">100/sec</SelectItem>
                <SelectItem value="200">200/sec</SelectItem>
                <SelectItem value="500">500/sec</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


export default ControlPanel