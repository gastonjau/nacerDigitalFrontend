import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDynamicDebounceMs,
  useDebouncedValue,
} from "@/hooks/useDebouncedValue";

describe("getDynamicDebounceMs", () => {
  it("devuelve 0 para texto vacío", () => {
    expect(getDynamicDebounceMs("")).toBe(0);
    expect(getDynamicDebounceMs("   ")).toBe(0);
  });

  it("usa 500ms para textos cortos", () => {
    expect(getDynamicDebounceMs("a")).toBe(500);
    expect(getDynamicDebounceMs("ab")).toBe(500);
  });

  it("usa 350ms para textos medios", () => {
    expect(getDynamicDebounceMs("abc")).toBe(350);
    expect(getDynamicDebounceMs("abcde")).toBe(350);
  });

  it("usa 220ms para textos largos", () => {
    expect(getDynamicDebounceMs("abcdef")).toBe(220);
    expect(getDynamicDebounceMs("gastonjau")).toBe(220);
  });
});

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("devuelve el valor inicial de inmediato", () => {
    const { result } = renderHook(() => useDebouncedValue("gastonjau", 300));
    expect(result.current).toBe("gastonjau");
  });

  it("actualiza el valor recién después del delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "gas" } },
    );

    rerender({ value: "gastonjau" });
    expect(result.current).toBe("gas");

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("gas");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("gastonjau");
  });

  it("cancela el timer anterior si el valor cambia", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "abc" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("abc");
  });

  it("aplica debounce dinámico según la longitud", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: "gastonjau" } },
    );

    rerender({ value: "x" });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("gastonjau");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("x");
  });
});
