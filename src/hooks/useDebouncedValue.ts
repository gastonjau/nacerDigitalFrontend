"use client";

import { useEffect, useState } from "react";

/** Debounce dinámico: más corto cuanto más largo es el texto. */
export function getDynamicDebounceMs(value: string) {
  const length = value.trim().length;

  if (length === 0) return 0;
  if (length < 3) return 500;
  if (length < 6) return 350;
  return 220;
}

export function useDebouncedValue<T extends string>(value: T, delayMs?: number) {
  const delay = delayMs ?? getDynamicDebounceMs(value);
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (delay === 0) {
      setDebounced(value);
      return;
    }

    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
