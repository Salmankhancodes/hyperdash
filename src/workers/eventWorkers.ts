import { computeDataTimed } from "@/lib/utils";

let arr: number[] = [];

self.onmessage = (e) => {
  const newEvents: number = e.data;
  // do heavy work + measure duration
  const { result, durationMs } = computeDataTimed(newEvents, arr);
  self.postMessage({
    processed: newEvents,
    size: result.length,
    durationMs,
  });
};
