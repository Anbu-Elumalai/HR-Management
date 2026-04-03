import React, { useCallback, useEffect, useRef } from 'react';
import { useAsync } from './useAsync';

export interface UsePageLoaderOptions<T> {
  /** Async function to fetch data */
  fetchFn: (params?: any) => Promise<T>;
  /** Initial data (optional) */
  initialData?: T | null;
  /** Auto-execute on mount */
  autoLoad?: boolean;
  /** Dependencies for auto-load */
  dependencies?: any[];
  /** Debounce delay in ms for auto-load */
  debounceMs?: number;
}

export interface UsePageLoaderReturn<T> extends ReturnType<typeof useAsync<T>> {
  /** Reload data */
  reload: () => Promise<T | void>;
  /** Set filters or params and auto-reload */
  setParams: (params: any) => void;
  /** Current params */
  params: any;
}

/**
 * usePageLoader
 * Specialized hook for page-level data fetching.
 *
 * Features:
 * - Initial page load with debouncing
 * - Parameter-based reloading (for filters/pagination)
 * - Auto-cleanup
 *
 * @example
 * ```tsx
 * const {
 *   data: candidates,
 *   loading,
 *   error,
 *   reload,
 *   setParams
 * } = usePageLoader({
 *   fetchFn: (params) => candidateService.getAllCandidates(params.page, params.limit, params.filters),
 *   autoLoad: true,
 *   debounceMs: 500
 * });
 *
 * // Update filters
 * setParams({ ...filters, page: 0 });
 * ```
 */
export function usePageLoader<T>(
  options: UsePageLoaderOptions<T>
): UsePageLoaderReturn<T> {
  const {
    fetchFn,
    initialData = null,
    autoLoad = true,
    dependencies = [],
    debounceMs = 0
  } = options;

  const { data, loading, error, execute, reset, setData, setError } = useAsync<T>(
    fetchFn,
    initialData
  );

  const paramsRef = useRef<any>({});

  const reload = useCallback(async () => {
    return execute(paramsRef.current);
  }, [execute]);

  const setParams = useCallback((newParams: any) => {
    paramsRef.current = { ...paramsRef.current, ...newParams };
  }, []);

  // Auto-load on mount with debounce
  useEffect(() => {
    if (autoLoad) {
      const timer = setTimeout(() => {
        if (!loading && !data) {
          execute(paramsRef.current);
        }
      }, debounceMs);

      return () => clearTimeout(timer);
    }
  }, [autoLoad, debounceMs, execute, loading, data, ...dependencies]);

  return {
    data,
    loading,
    error,
    execute: reload,
    reset,
    setData,
    setError,
    reload,
    setParams,
    get params() {
      return paramsRef.current;
    }
  };
}

export default usePageLoader;
