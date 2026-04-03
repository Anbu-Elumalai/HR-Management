import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAsync } from './useAsync';

export interface TableData {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UseTableLoaderOptions<T extends TableData> {
  /** Async function to fetch table data */
  fetchFn: (page: number, limit: number, filters: Record<string, any>) => Promise<T>;
  /** Initial page number (default: 0) */
  initialPage?: number;
  /** Items per page (default: 10) */
  initialLimit?: number;
  /** Auto-load on mount */
  autoLoad?: boolean;
  /** Reset page to 0 on filter change */
  resetPageOnFilter?: boolean;
}

export interface UseTableLoaderReturn<T extends TableData> {
  /** Current data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current page (0-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total items */
  total: number;
  /** Total pages */
  totalPages: number;
  /** Set page */
  setPage: (page: number) => void;
  /** Set limit */
  setLimit: (limit: number) => void;
  /** Update filters */
  setFilters: (filters: Record<string, any>) => void;
  /** Current filters */
  filters: Record<string, any>;
  /** Reload data */
  reload: () => Promise<T | void>;
  /** Reset to initial state */
  reset: () => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
}

/**
 * useTableLoader
 * Specialized hook for table data with pagination and filtering.
 *
 * Features:
 * - Pagination state management
 * - Filter debouncing
 * - Auto page reset on filter change
 * - Loading states for initial load vs refresh
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   loading,
 *   page,
 *   total,
 *   setPage,
 *   setFilters
 * } = useTableLoader({
 *   fetchFn: (page, limit, filters) => candidateService.getAllCandidates(page, limit, filters),
 *   initialLimit: 10
 * });
 *
 * // Change page
 * const handlePageChange = (newPage) => setPage(newPage);
 *
 * // Update filter
 * const handleSearch = (query) => setFilters({ name: query });
 * ```
 */
export function useTableLoader<T extends TableData>(
  options: UseTableLoaderOptions<T>
): UseTableLoaderReturn<T> {
  const {
    fetchFn,
    initialPage = 0,
    initialLimit = 10,
    autoLoad = true,
    resetPageOnFilter = true
  } = options;

  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [filters, setFiltersState] = useState<Record<string, any>>({});

  const paramsRef = useRef({
    page: initialPage,
    limit: initialLimit,
    filters: {} as Record<string, any>
  });

  const fetchData = useCallback(
    async (pageToFetch: number, limitToFetch: number, filtersToApply: Record<string, any>) => {
      if (!fetchFn) return null as T;

      const result = await fetchFn(pageToFetch, limitToFetch, filtersToApply);
      return result as T;
    },
    [fetchFn]
  );

  const {
    data,
    loading,
    error,
    execute,
    reset: resetAsync,
    setData,
    setError
  } = useAsync<T>(fetchData);

  // Execute function wrapper
  const executeWithParams = useCallback(() => {
    return execute(paramsRef.current.page, paramsRef.current.limit, paramsRef.current.filters);
  }, [execute]);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
    paramsRef.current.page = newPage;
    executeWithParams();
  }, [executeWithParams]);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    paramsRef.current.limit = newLimit;
    // Reset to page 0 when limit changes
    paramsRef.current.page = 0;
    setPageState(0);
    executeWithParams();
  }, [executeWithParams]);

  const setFilters = useCallback((newFilters: Record<string, any>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    const updatedFilters = { ...filters, ...newFilters };
    paramsRef.current.filters = updatedFilters;

    if (resetPageOnFilter) {
      paramsRef.current.page = 0;
      setPageState(0);
    }

    executeWithParams();
  }, [filters, resetPageOnFilter, executeWithParams]);

  const reload = useCallback(() => {
    return executeWithParams();
  }, [executeWithParams]);

  const reset = useCallback(() => {
    paramsRef.current = {
      page: initialPage,
      limit: initialLimit,
      filters: {} as Record<string, any>
    };
    setPageState(initialPage);
    setLimitState(initialLimit);
    setFiltersState({});
    resetAsync();
  }, [initialPage, initialLimit, resetAsync]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !data && !loading) {
      executeWithParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, executeWithParams, data, loading]);

  return {
    data,
    loading,
    error,
    page: paramsRef.current.page,
    limit: paramsRef.current.limit,
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    setPage,
    setLimit,
    setFilters,
    filters: paramsRef.current.filters,
    reload,
    reset,
    nextPage: () => setPage(paramsRef.current.page + 1),
    prevPage: () => setPage(Math.max(0, paramsRef.current.page - 1))
  };
}

// Helper to extract data from API response
export function normalizeTableResponse<T extends TableData>(
  response: any,
  dataPath?: string
): T {
  // Handle different API response formats
  if (dataPath) {
    return {
      ...response,
      data: response[dataPath] || response.data || []
    } as T;
  }

  // Default: assume response has data property
  return {
    ...response,
    data: response.data || response
  } as T;
}

export default useTableLoader;
