import { useState, useCallback, useRef } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: any[]) => Promise<T | void>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: Error | null) => void;
}

/**
 * useAsync - Core hook for managing async operations with loading state.
 *
 * Features:
 * - Automatic loading state management
 * - Error handling
 * - Prevent duplicate calls
 * - Reset functionality
 *
 * @param asyncFn - Async function to execute (receives abort signal)
 * @param initialData - Optional initial data
 * @returns Async state and control functions
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useAsync(fetchUsers);
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 *
 * return <div>{loading ? 'Loading...' : data?.map(...)}</div>;
 * ```
 */
export function useAsync<T>(
  asyncFn?: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const execute = useCallback(
    async (...args: any[]): Promise<T | void> => {
      if (!asyncFn) {
        console.warn('useAsync: No async function provided');
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFn(...args, abortController.signal);

        if (isMountedRef.current) {
          setState({
            data: result,
            loading: false,
            error: null
          });
        }

        return result;
      } catch (error: any) {
        // Ignore abort errors
        if (error.name === 'AbortError') {
          return;
        }

        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error))
          }));
        }

        throw error;
      }
    },
    [asyncFn]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({ ...prev, data: initialData, loading: false, error: null }));
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError
  };
}

export default useAsync;
