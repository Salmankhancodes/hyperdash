"use client"
import { useEffect, useRef, useState } from "react";

export function FPSCounter() {
  // FPS is kept local intentionally to avoid global re-renders.
  // This mirrors how performance metrics are usually observed, not stored.

  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    lastTime.current = performance.now();
    let rafId: number;

    const loop = (time: number) => {
      frameCount.current++;

      if (time - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = time;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return <span>{fps}</span>;
}
