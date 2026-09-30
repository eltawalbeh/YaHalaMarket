import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase/client";

export function db() {
  if (!supabase)
    throw new Error(
      "اتصال النظام غير مهيأ / Database connection is not configured",
    );
  return supabase;
}
export async function request<T = any>(
  query: PromiseLike<{ data: any; error: { message: string } | null }>,
): Promise<T> {
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "تعذّر إتمام العملية / Request failed";
}
export function useResource<T>(
  loader: () => Promise<T>,
  dependencies: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    const current = ++sequence.current;
    setLoading(true);
    setError("");
    try {
      const value = await loader();
      if (sequence.current === current) setData(value);
    } catch (e) {
      if (sequence.current === current) setError(errorMessage(e));
    } finally {
      if (sequence.current === current) setLoading(false);
    }
  }, dependencies);
  useEffect(() => {
    void reload();
    return () => {
      sequence.current++;
    };
  }, [reload]);
  return { data, setData, loading, error, reload };
}
