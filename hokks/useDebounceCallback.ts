"use client";

import { useCallback, useEffect, useRef } from "react";

function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  const cancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return { debounced, cancel };
}

export default useDebouncedCallback;
