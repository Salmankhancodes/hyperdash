import { useEffect, useRef } from "react";

export function useRenderCount(label: string) {
  const count = useRef(0);

  useEffect(() => {
    count.current += 1;

    // console.log(`${label} renders:`, count.current);
  }, [label]);
}
