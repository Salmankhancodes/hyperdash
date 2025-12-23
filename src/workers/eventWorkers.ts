import { computeData } from "@/lib/utils";

let arr: number[] = [];

self.onmessage = (e) => {
  const newEvents: number = e.data;
  // do heavy work
  const data = computeData(newEvents, arr);
  self.postMessage({
    processed: newEvents,
    size: data.length,
  });
};
