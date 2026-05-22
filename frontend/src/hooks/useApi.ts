/**
 * useApi.ts — Custom hook untuk fetch API dengan loading, error, toast handling.
 * Dipakai di semua komponen sebagai pengganti fetch langsung.
 */
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { ApiError } from "../services/api.js";

interface UseApiOptions {
  /** Pesan sukses yang ditampilkan di toast (opsional) */
  successMessage?: string;
  /** Jika true, error tidak ditampilkan sebagai toast */
  silentError?: boolean;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook untuk memanggil fungsi async API dan mengelola state-nya.
 *
 * @example
 * const { data, loading, error, execute } = useApi(searchKata);
 * useEffect(() => { execute("siri'") }, []);
 */
export function useApi<TArgs extends unknown[], TResult>(
  apiFn: (...args: TArgs) => Promise<TResult>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<TResult>>({
    data: null,
    loading: false,
    error: null,
  });

  // Track mounted state to avoid setState on unmounted component
  const mountedRef = useRef(true);
  const setMounted = (v: boolean) => { mountedRef.current = v; };
  // (cleanup dihandle di komponen via useEffect return)

  const execute = useCallback(
    async (...args: TArgs) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await apiFn(...args);
        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null });
          if (options.successMessage) {
            toast.success(options.successMessage);
          }
        }
        return result;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Terjadi kesalahan yang tidak terduga.";

        if (mountedRef.current) {
          setState((s) => ({ ...s, loading: false, error: message }));
          if (!options.silentError) {
            const isNetworkError =
              err instanceof ApiError && err.status === 0;
            toast.error(isNetworkError ? "⚠️ Backend tidak dapat dijangkau" : "Gagal memuat data", {
              description: message,
              action: isNetworkError
                ? {
                    label: "Coba Lagi",
                    onClick: () => execute(...args),
                  }
                : undefined,
              duration: isNetworkError ? 6000 : 4000,
            });
          }
        }
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiFn]
  );

  return { ...state, execute, setMounted };
}

/**
 * Hook sederhana untuk fetch data saat mount (tanpa lazy execution).
 */
export function useFetch<T>(
  apiFn: () => Promise<T>,
  deps: unknown[] = [],
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await apiFn();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal memuat data.";
      setState((s) => ({ ...s, loading: false, error: message }));
      if (!options.silentError) {
        const isNetworkError = err instanceof ApiError && err.status === 0;
        toast.error(
          isNetworkError ? "⚠️ Backend tidak dapat dijangkau" : "Gagal memuat data",
          {
            description: message,
            duration: isNetworkError ? 6000 : 4000,
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Auto-fetch on mount and when deps change
  // (caller uses useEffect + refetch)
  return { ...state, refetch };
}
