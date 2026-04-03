import React from 'react';
import './loaderStyles.css';

export interface ProgressLoaderProps {
  /** Current progress percentage (0-100) */
  progress: number;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Custom message */
  message?: string;
  /** Height of progress bar */
  height?: number;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'success';
  /** Additional class */
  className?: string;
}

/**
 * ProgressLoader
 * Shows upload progress with animated progress bar.
 *
 * Usage:
 * ```tsx
 * const { progress, uploading, handleUpload } = useUploadLoader();
 *
 * <ProgressLoader
 *   progress={progress}
 *   message={uploading ? 'Uploading...' : 'Upload Complete'}
 * />
 * ```
 */
const ProgressLoader: React.FC<ProgressLoaderProps> = ({
  progress,
  showPercentage = true,
  message,
  height = 8,
  variant = 'primary',
  className = ''
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  const variantColors = {
    primary: {
      start: '#2dd4bf',
      end: '#0d9488',
      bg: '#e2e8f0',
      text: '#0d9488'
    },
    secondary: {
      start: '#3b82f6',
      end: '#2563eb',
      bg: '#e2e8f0',
      text: '#2563eb'
    },
    success: {
      start: '#10b981',
      end: '#059669',
      bg: '#e2e8f0',
      text: '#059669'
    }
  };

  const colors = variantColors[variant];

  return (
    <div className={`progress-loader-container ${className}`} style={{ width: '100%' }}>
      {message && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <span style={{ color: '#64748b' }}>{message}</span>
          {showPercentage && (
            <span
              style={{
                color: colors.text,
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {normalizedProgress}%
            </span>
          )}
        </div>
      )}
      <div
        className="progress-bar-bg"
        style={{
          height: `${height}px`,
          background: colors.bg,
          borderRadius: `${height / 2}px`,
          overflow: 'hidden'
        }}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${normalizedProgress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${colors.start} 0%, ${colors.end} 100%)`,
            borderRadius: `${height / 2}px`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressLoader;
