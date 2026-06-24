"use client"
import { useEffect, useRef, useState } from "react";

interface FPSCounterProps {
  /** Optional callback fired every second with the latest FPS value.
   *  Used to surface FPS to the store for baseline comparisons. */
  onFps?: (fps: number) => void;
  testId?: string;
}

export function FPSCounter({ onFps, testId }: FPSCounterProps) {
  // FPS is kept local intentionally to avoid global re-renders.
  // This mirrors how performance metrics are usually observed, not stored.

  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const onFpsRef = useRef(onFps);
  const [fps, setFps] = useState(0);

  // Keep callback ref fresh without re-triggering the effect
  useEffect(() => {
    onFpsRef.current = onFps;
  }, [onFps]);

  useEffect(() => {
    lastTime.current = performance.now();
    let rafId: number;

    const loop = (time: number) => {
      frameCount.current++;

      if (time - lastTime.current >= 1000) {
        const currentFps = frameCount.current;
        setFps(currentFps);
        onFpsRef.current?.(currentFps);
        frameCount.current = 0;
        lastTime.current = time;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return <span data-testid={testId}>{fps}</span>;
}
