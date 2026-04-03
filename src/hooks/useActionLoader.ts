import { useCallback } from 'react';
import { useAsync } from './useAsync';

export interface UseActionLoaderOptions<T = any> {
  /** Async function to execute */
  actionFn: (...args: any[]) => Promise<T>;
  /** Auto-reset loading after completion (default: true) */
  autoReset?: boolean;
  /** Callback on success */
  onSuccess?: (result: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Whether this action should show immediate feedback */
  showFeedback?: boolean;
}

export interface UseActionLoaderReturn<T = any> {
  /** Execute the action */
  execute: (...args: any[]) => Promise<T | void>;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Result of last execution */
  result: T | null;
  /** Reset state */
  reset: () => void;
  /** Clear error */
  clearError: () => void;
}

/**
 * useActionLoader
 * Hook for managing single action operations (create, update, delete).
 *
 * Features:
 * - Automatic loading state
 * - Success/error callbacks
 * - Result retention
 * - Manual reset capability
 *
 * @example
 * ```tsx
 * const {
 *   loading,
 *   error,
 *   execute
 * } = useActionLoader({
 *   actionFn: candidateService.deleteCandidate,
 *   onSuccess: () => {
 *     toast.success('Deleted!');
 *     reloadList();
 *   }
 * });
 *
 * const handleDelete = () => {
 *   execute(candidateId);
 * };
 * ```
 */
export function useActionLoader<T = any>(
  options: UseActionLoaderOptions<T>
): UseActionLoaderReturn<T> {
  const {
    actionFn,
    autoReset = true,
    onSuccess,
    onError,
    showFeedback = true
  } = options;

  const { data: result, loading, error, execute, reset, setData, setError } = useAsync<T>(
    actionFn,
    null
  );

  const executeWithCallbacks = useCallback(
    async (...args: any[]): Promise<T | void> => {
      try {
        const result = await execute(...args);

        if (result !== undefined && onSuccess) {
          onSuccess(result);
        }

        // Auto reset after successful completion
        if (autoReset && showFeedback) {
          // Small delay to show success state before reset
          setTimeout(() => {
            reset();
          }, 500);
        }

        return result;
      } catch (err) {
        if (onError && err instanceof Error) {
          onError(err);
        }
        throw err;
      }
    },
    [execute, autoReset, onSuccess, onError, showFeedback, reset]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    execute: executeWithCallbacks,
    loading,
    error,
    result,
    reset,
    clearError
  };
}

export default useActionLoader;
