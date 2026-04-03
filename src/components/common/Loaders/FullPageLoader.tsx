import React from 'react';
import Spinner from './Spinner';
import './loaderStyles.css';

export interface FullPageLoaderProps {
  /** Message to display */
  message?: string;
  /** Spinner size */
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Background color (default transparent) */
  backgroundColor?: string;
  /** Whether to show backdrop blur */
  showBlur?: boolean;
  /** Custom class */
  className?: string;
}

/**
 * FullPageLoader
 * Displays a centered full-screen loader for initial page loads
 *
 * Usage:
 * ```tsx
 * if (loading && !hasData) {
 *   return <FullPageLoader message="Loading candidates..." />;
 * }
 * ```
 */
const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = 'Loading...',
  spinnerSize = 'lg',
  backgroundColor = 'transparent',
  showBlur = false,
  className = ''
}) => {
  return (
    <div
      className={`full-page-loader ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        backgroundColor,
        zIndex: 9999,
        minHeight: '100vh'
      }}
    >
      {showBlur && (
        <style>{`
          .full-page-loader {
            backdrop-filter: blur(4px);
            background: rgba(255, 255, 255, 0.85) !important;
          }
        `}</style>
      )}
      <Spinner size={spinnerSize} variant="primary" premium />
      <p
        className="loader-text"
        style={{
          color: '#64748b',
          fontSize: '1.05rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textAlign: 'center',
          margin: 0
        }}
      >
        {message}
      </p>
    </div>
  );
};

export default FullPageLoader;
