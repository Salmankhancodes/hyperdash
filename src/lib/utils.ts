import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MAX_COMPUTE_WINDOW = 10000;
const WORK_FACTOR = 0.75; // tuned so worker offloading remains visible while the dashboard can sustain four-digit throughput
export function computeData(newEvents: number, arr: number[]){
    // --- HEAVY WORK START ---
    for (let i = 0; i < newEvents * WORK_FACTOR; i++) {
      arr.push(Math.random() * 1000);           // simulate data push
      const slice = arr.slice(-MAX_COMPUTE_WINDOW); // maintain window
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length; // p50 avg
      const max = Math.max(...slice);           // max
      const min = Math.min(...slice);           // min
      const mapped = slice.map((v) => Math.sqrt(v)); // chart transform
      void avg;
      void max;
      void min;
      void mapped;
    }

    if (arr.length > MAX_COMPUTE_WINDOW) {
      arr.splice(0, arr.length - MAX_COMPUTE_WINDOW);
    }

    // --- HEAVY WORK END ---

    return arr;
}

/** Timed wrapper — returns the mutated array plus wall-clock duration in ms. */
export function computeDataTimed(newEvents: number, arr: number[]){
    const start = performance.now();
    const result = computeData(newEvents, arr);
    const durationMs = performance.now() - start;
    return { result, durationMs };
}