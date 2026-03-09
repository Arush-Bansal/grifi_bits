"use client";

import { useEffect, useRef } from "react";
import isEqual from "lodash/isEqual";

/**
 * A reusable hook for debounced auto-saving.
 * 
 * @param data The data to watch for changes.
 * @param onSave The callback function to execute when data changes (after debounce).
 * @param enabled Whether auto-save is enabled.
 * @param debounceMs The debounce delay in milliseconds.
 */
export function useAutoSave<T>(
  data: T | undefined | null,
  onSave: (data: T) => void | Promise<void>,
  enabled: boolean = true,
  debounceMs: number = 2000
) {
  const onSaveRef = useRef(onSave);
  const previousDataRef = useRef<T | undefined | null>(data);
  
  // Keep onSave callback fresh
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled || !data) return;

    // Only trigger save if data has actually changed deeply
    if (isEqual(previousDataRef.current, data)) {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      onSaveRef.current(data as T);
      previousDataRef.current = data;
    }, debounceMs);

    return () => clearTimeout(delayDebounceFn);
  }, [data, enabled, debounceMs]);
}
