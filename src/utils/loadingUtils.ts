/**
 * Loading Utilities
 * Common helper functions for loading state management
 */

/**
 * Debounce function to prevent rapid successive calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function to limit execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Check if value is loading state (boolean or loading object)
 */
export function isLoading(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (value && typeof value === 'object') {
    return value.loading === true || value.isLoading === true;
  }
  return false;
}

/**
 * Safely extract data from various response formats
 */
export function extractApiData<T>(
  response: any,
  defaultPath?: string
): T | null {
  try {
    // Direct data
    if (response && typeof response === 'object') {
      // Common API patterns
      if (response.data !== undefined) {
        return response.data as T;
      }
      if (response.payload !== undefined) {
        return response.payload as T;
      }
      if (response.result !== undefined) {
        return response.result as T;
      }
      if (response.items !== undefined) {
        return response.items as T;
      }
      // If response looks like the data itself
      if (Array.isArray(response) || (response && !response.status && !response.message)) {
        return response as T;
      }
    }

    // Try custom path like response[dataPath]
    if (defaultPath) {
      const pathParts = defaultPath.split('.');
      let current = response;
      for (const part of pathParts) {
        current = current?.[part];
        if (current === undefined) return null;
      }
      return current as T;
    }

    return null;
  } catch (error) {
    console.error('Error extracting API data:', error);
    return null;
  }
}

/**
 * Normalize paginated response to standard format
 */
export function normalizePaginationResponse<T>(
  response: any,
  options: {
    dataPath?: string;
    totalPath?: string;
    pageParam?: string;
    limitParam?: string;
  } = {}
): { data: T[]; total: number; page: number; limit: number; totalPages: number } {
  const {
    dataPath = 'data',
    totalPath = 'total',
    pageParam = 'page',
    limitParam = 'limit'
  } = options;

  const data = extractApiData<any[]>(response, dataPath) || [];
  const total = extractApiData<number>(response, totalPath) || data.length;
  const page = extractApiData<number>(response, pageParam) || 0;
  const limit = extractApiData<number>(response, limitParam) || data.length;
  const totalPages = Math.ceil(total / limit) || 0;

  return { data, total, page, limit, totalPages };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileType = file.type;
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileExtension === type.slice(1);
    }
    return fileType === type || fileType.includes(type);
  });
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
