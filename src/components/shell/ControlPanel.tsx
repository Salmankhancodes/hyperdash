"use client"
// ControlPanel.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
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
  const setWorkerEnabled = useEventStore(s => s.toggleWorker);
  const setBatchInterval = useEventStore(s => s.setBatchInterval);
  const setEventRatePreset = useEventStore(s => s.setEventRatePreset);
  console.log("ControlPanel render");
  console.log("workerEnabled:", workerEnabled);
  console.log("batchInterval:", batchInterval);
  console.log("eventRatePreset:", eventRatePreset);
  return (
    <Card className="mb-4">
      <CardContent className="flex flex-wrap gap-12 py-4">
        {/* Worker Toggle */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Web Worker Processing</span>
              <span className="text-xs text-muted-foreground">Offloads event computation from main thread</span>
            </div>
            <Switch
              checked={workerEnabled}
              onCheckedChange={setWorkerEnabled}
            />
            <span className="text-xs font-medium text-muted-foreground min-w-16">
              {workerEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        {/* Batch Interval */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Batch Flush Interval (ms)</span>
          <span className="text-xs text-muted-foreground mb-1">How often buffered events are committed to the UI</span>
          <Select
            value={String(batchInterval)}
            onValueChange={value => setBatchInterval(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
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
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Event Ingestion Rate</span>
          <span className="text-xs text-muted-foreground mb-1">Controls how frequently new events are generated</span>
          <Select
            value={eventRatePreset}
            onValueChange={value =>
              setEventRatePreset(value as "normal" | "high" | "extreme")
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="extreme">Extreme</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}


export default ControlPanel