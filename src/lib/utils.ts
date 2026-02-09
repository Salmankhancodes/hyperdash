import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const WORK_FACTOR = 200; // tune this — balanced against EVENT_MULTIPLIER to keep total computation constant
export function computeData(newEvents: number, arr: number[]){
    // --- HEAVY WORK START ---
    for (let i = 0; i < newEvents * WORK_FACTOR; i++) {
      arr.push(Math.random() * 1000);           // simulate data push
      const slice = arr.slice(-10000);          // maintain window
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length; // p50 avg
      const max = Math.max(...slice);           // max
      const min = Math.min(...slice);           // min
      const mapped = slice.map((v) => Math.sqrt(v)); // chart transform
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