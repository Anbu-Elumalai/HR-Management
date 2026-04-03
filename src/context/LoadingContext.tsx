import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingContextType {
  /** Global loading state */
  globalLoading: boolean;
  /** Counter for concurrent operations */
  loadingCount: number;
  /** Set a specific loader state */
  setLoader: (key: string, loading: boolean) => void;
  /** Get loader state */
  getLoader: (key: string) => boolean;
  /** Start a global loader */
  startLoading: (message?: string) => string;
  /** Stop a global loader */
  stopLoading: (key: string) => void;
  /** Check if any loader is active */
  isLoading: () => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

/**
 * LoadingContext
 * Global loading state management for application-wide loaders.
 *
 * Features:
 * - Multiple concurrent loaders
 * - Named loader states
 * - Automatic count-based global loading
 * - Clean API for starting/stopping loaders
 *
 * @example
 * ```tsx
 * // In App.jsx
 * const LoadingProvider = () => (
 *   <LoadingContext.Provider>
 *     <App />
 *   </LoadingContext.Provider>
 * );
 *
 * // In any component
 * const { startLoading, stopLoading } = useLoadingContext();
 *
 * const handleSave = async () => {
 *   const key = startLoading('Saving...');
 *   await saveData();
 *   stopLoading(key);
 * };
 * ```
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loaderStates, setLoaderStates] = useState<Record<string, boolean>>({});
  const [globalCounter, setGlobalCounter] = useState(0);

  const setLoader = useCallback((key: string, loading: boolean) => {
    setLoaderStates(prev => ({ ...prev, [key]: loading }));
  }, []);

  const getLoader = useCallback((key: string) => {
    return loaderStates[key] || false;
  }, [loaderStates]);

  const startLoading = useCallback((message?: string): string => {
    const key = message || `loader_${Date.now()}`;
    setLoader(key, true);
    setGlobalCounter(prev => prev + 1);
    return key;
  }, [setLoader]);

  const stopLoading = useCallback((key: string) => {
    setLoader(key, false);
    setGlobalCounter(prev => Math.max(0, prev - 1));
  }, [setLoader]);

  const isLoading = useCallback(() => {
    return globalCounter > 0 || Object.values(loaderStates).some(state => state);
  }, [globalCounter, loaderStates]);

  const value: LoadingContextType = {
    globalLoading: globalCounter > 0,
    loadingCount: globalCounter,
    setLoader,
    getLoader,
    startLoading,
    stopLoading,
    isLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

/**
 * Hook to use loading context
 */
export const useLoadingContext = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
};

export { LoadingContext };
