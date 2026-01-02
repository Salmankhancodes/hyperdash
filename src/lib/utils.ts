import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const WORK_FACTOR = 500; // tune this
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