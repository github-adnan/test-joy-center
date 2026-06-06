import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
} from "react";

type NativeInputElement = HTMLInputElement;

interface WebViewInputOptions {
  sanitize?: (value: string) => string;
  onValueChange?: (value: string) => void;
  pollMs?: number;
}

export function useWebViewInputValue(initialValue = "", options: WebViewInputOptions = {}) {
  const inputRef = useRef<NativeInputElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const sanitizeRef = useRef(options.sanitize);
  const onValueChangeRef = useRef(options.onValueChange);
  const latestRef = useRef(options.sanitize?.(initialValue) ?? initialValue);
  const [value, setReactValue] = useState(latestRef.current);

  useEffect(() => {
    sanitizeRef.current = options.sanitize;
    onValueChangeRef.current = options.onValueChange;
  }, [options.sanitize, options.onValueChange]);

  const applyValue = useCallback((nextValue: string) => {
    const sanitized = sanitizeRef.current?.(nextValue) ?? nextValue;
    const input = inputRef.current;

    if (input && input.value !== sanitized) {
      input.value = sanitized;
    }

    if (latestRef.current !== sanitized) {
      latestRef.current = sanitized;
      setReactValue(sanitized);
      onValueChangeRef.current?.(sanitized);
    }

    return sanitized;
  }, []);

  const sync = useCallback(() => applyValue(inputRef.current?.value ?? ""), [applyValue]);

  const stopPolling = useCallback(() => {
    if (timerRef.current !== null && typeof window !== "undefined") {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (typeof window === "undefined") return;
    stopPolling();
    timerRef.current = window.setInterval(sync, options.pollMs ?? 40);
  }, [options.pollMs, stopPolling, sync]);

  const syncFromEvent = useCallback(
    (event: FormEvent<NativeInputElement>) => applyValue(event.currentTarget.value),
    [applyValue],
  );

  const syncAfterNativeInput = useCallback(() => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(sync);
  }, [sync]);

  const handleFocus = useCallback(
    (_event: FocusEvent<NativeInputElement>) => {
      sync();
      startPolling();
    },
    [startPolling, sync],
  );

  const handleBlur = useCallback(
    (_event: FocusEvent<NativeInputElement>) => {
      sync();
      stopPolling();
    },
    [stopPolling, sync],
  );

  useEffect(() => {
    const sanitized = sanitizeRef.current?.(initialValue) ?? initialValue;
    if (typeof document !== "undefined" && document.activeElement === inputRef.current) return;
    applyValue(sanitized);
  }, [applyValue, initialValue]);

  useEffect(() => stopPolling, [stopPolling]);

  const inputProps = useMemo(
    () => ({
      ref: inputRef,
      defaultValue: latestRef.current,
      onInput: syncFromEvent,
      onChange: syncFromEvent,
      onBeforeInput: syncAfterNativeInput,
      onKeyUp: syncAfterNativeInput,
      onFocus: handleFocus,
      onBlur: handleBlur,
    }),
    [handleBlur, handleFocus, syncAfterNativeInput, syncFromEvent],
  );

  return {
    inputProps,
    ref: inputRef,
    value,
    setValue: applyValue,
    sync,
  };
}