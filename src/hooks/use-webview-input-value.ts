import { useCallback, useEffect, useRef, useState } from "react";

interface WebViewInputOptions {
  sanitize?: (value: string) => string;
  onValueChange?: (value: string) => void;
}

/**
 * Simple controlled input helper. Previous versions polled and mutated
 * `input.value` on a timer, which fought the Android IME composition
 * cycle and froze typing inside the APK WebView. Standard React
 * controlled inputs work reliably — keep it that way.
 */
export function useWebViewInputValue(initialValue = "", options: WebViewInputOptions = {}) {
  const sanitizeRef = useRef(options.sanitize);
  const onChangeRef = useRef(options.onValueChange);

  useEffect(() => {
    sanitizeRef.current = options.sanitize;
    onChangeRef.current = options.onValueChange;
  });

  const [value, setValueState] = useState(
    () => sanitizeRef.current?.(initialValue) ?? initialValue,
  );

  const setValue = useCallback((next: string) => {
    const sanitized = sanitizeRef.current?.(next) ?? next;
    setValueState(sanitized);
    onChangeRef.current?.(sanitized);
    return sanitized;
  }, []);

  // Keep in sync when the external initialValue changes (e.g. settings load).
  useEffect(() => {
    const sanitized = sanitizeRef.current?.(initialValue) ?? initialValue;
    setValueState((prev) => (prev === sanitized ? prev : sanitized));
  }, [initialValue]);

  const sync = useCallback(() => value, [value]);

  return {
    value,
    setValue,
    sync,
    inputProps: {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    },
  };
}
