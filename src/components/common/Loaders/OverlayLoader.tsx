import React from 'react';
import Spinner from './Spinner';
import './loaderStyles.css';

export interface OverlayLoaderProps {
  /** Show the overlay (auto-managed if using with condition) */
  visible: boolean;
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom message */
  message?: string;
  /** Container element (defaults to positioning relative) */
  children?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * OverlayLoader
 * Semi-transparent overlay with spinner for tables, cards, and content areas.
 * Shows on top of existing content while data refreshes.
 *
 * Usage:
 * ```tsx
 * <div className="table-card" style={{ position: 'relative' }}>
 *   <OverlayLoader visible={loading} size="md" />
 *   {/* Table content */}
 * </div>
 * ```
 */
const OverlayLoader: React.FC<OverlayLoaderProps> = ({
  visible,
  size = 'md',
  message,
  children,
  className = ''
}) => {
  if (!visible) {
    return <>{children}</>;
  }

  return (
    <div
      className={`overlay-loader-container ${className}`}
      style={{ position: 'relative' }}
    >
      {children}
      <div
        className="loading-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          transition: 'all 0.3s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <Spinner size={size} variant="primary" premium />
          {message && (
            <span
              style={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverlayLoader;
