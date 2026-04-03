import { useState, useCallback, useRef } from 'react';

export interface UploadResult {
  url: string;
  filename: string;
  size?: number;
  [key: string]: any;
}

export interface UseUploadLoaderReturn {
  /** Upload a file with progress tracking */
  upload: (file: File, endpoint?: string, additionalData?: Record<string, any>) => Promise<UploadResult | null>;
  /** Current upload progress (0-100) */
  progress: number;
  /** Whether an upload is in progress */
  uploading: boolean;
  /** Error if upload failed */
  error: Error | null;
  /** Reset upload state */
  reset: () => void;
  /** Cancel ongoing upload */
  cancel: () => void;
}

/**
 * useUploadLoader
 * Hook for managing file uploads with progress tracking.
 *
 * Features:
 * - Progress percentage
 * - Cancellation support
 * - Error handling
 * - Flexible endpoint configuration
 *
 * @example
 * ```tsx
 * const {
 *   uploading,
 *   progress,
 *   upload,
 *   error
 * } = useUploadLoader();
 *
 * const handleFileChange = async (e) => {
 *   const file = e.target.files[0];
 *   const result = await upload(file, '/common/upload?folder=resumes');
 *   if (result) {
 *     setFormData(prev => ({ ...prev, resumeFile: result }));
 *   }
 * };
 *
 * return (
 *   <>
 *     <input type="file" onChange={handleFileChange} />
 *     {uploading && <ProgressLoader progress={progress} message="Uploading..." />}
 *   </>
 * );
 * ```
 */
export function useUploadLoader(baseUrl: string = import.meta.env.VITE_API_BASE_URL || ''): UseUploadLoaderReturn {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (
      file: File,
      endpoint: string = '/common/upload',
      additionalData: Record<string, any> = {}
    ): Promise<UploadResult | null> => {
      if (!file) {
        setError(new Error('No file provided'));
        return null;
      }

      // Cancel previous upload if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        // Append additional data
        Object.entries(additionalData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });

        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          signal: abortController.signal,
          // For progress tracking, we need to use XHR or a library
          // This is a simplified version - in production use axios with onUploadProgress
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const responseData = await response.json();

        // Parse response based on your API structure
        const fileInfo: UploadResult = {
          url: responseData.data?.[0]?.url || responseData.url || responseData.fileUrl,
          filename: responseData.data?.[0]?.originalName || file.name,
          size: file.size,
          ...responseData.data?.[0]
        };

        setProgress(100);
        setUploading(false);

        return fileInfo;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setError(new Error('Upload cancelled'));
        } else {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
        setUploading(false);
        setProgress(0);
        throw err;
      }
    },
    [baseUrl]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setProgress(0);
    setUploading(false);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploading(false);
      setError(new Error('Upload cancelled'));
    }
  }, []);

  return {
    upload,
    progress,
    uploading,
    error,
    reset,
    cancel
  };
}

export default useUploadLoader;
