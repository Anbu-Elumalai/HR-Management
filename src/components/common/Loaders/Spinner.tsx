import React from 'react';
import './loaderStyles.css';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Color variant */
  variant?: SpinnerVariant;
  /** Additional CSS class */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Text label to show below spinner */
  label?: string;
  /** Show premium animation (true) or simple (false) */
  premium?: boolean;
}

const sizeMap = {
  sm: { width: '20px', height: '20px', core: '30%' },
  md: { width: '40px', height: '40px', core: '30%' },
  lg: { width: '64px', height: '64px', core: '30%' },
  xl: { width: '96px', height: '96px', core: '25%' }
};

const variantColors = {
  primary: {
    before: 'rgba(45, 212, 191, 1)', // teal-400
    after: 'rgba(13, 148, 136, 1)',  // teal-500
    coreStart: '#2dd4bf',
    coreEnd: '#0d9488',
    boxShadow: '0 0 20px rgba(45, 212, 191, 0.6)'
  },
  secondary: {
    before: 'rgba(59, 130, 246, 1)', // blue-500
    after: 'rgba(37, 99, 235, 1)',   // blue-600
    coreStart: '#3b82f6',
    coreEnd: '#2563eb',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
  },
  white: {
    before: 'rgba(255, 255, 255, 0.9)',
    after: 'rgba(255, 255, 255, 0.7)',
    coreStart: '#ffffff',
    coreEnd: '#f0f9ff',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
  }
};

/**
 * Premium Spinner Component
 * Reusable loading indicator with smooth animations
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  style = {},
  label,
  premium = true
}) => {
  const dimensions = sizeMap[size];
  const colors = variantColors[variant];

  if (premium) {
    return (
      <div
        className={`premium-spinner-container ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          ...style
        }}
      >
        <div
          className="premium-spinner"
          style={{
            width: dimensions.width,
            height: dimensions.height
          }}
        >
          <style>{`
            .premium-spinner::before {
              width: 100% !important;
              height: 100% !important;
              border-top-color: ${colors.before} !important;
              border-bottom-color: ${colors.after} !important;
              box-shadow: ${colors.boxShadow} !important;
            }
            .premium-spinner::after {
              width: 70% !important;
              height: 70% !important;
              border-left-color: ${colors.after} !important;
              border-right-color: ${colors.before} !important;
            }
            .premium-core {
              width: ${dimensions.core} !important;
              height: ${dimensions.core} !important;
              background: radial-gradient(circle, ${colors.coreStart} 0%, ${colors.coreEnd} 100%) !important;
              box-shadow: ${colors.boxShadow} !important;
            }
          `}</style>
          <div className="premium-core" />
        </div>
        {label && (
          <span
            className="spinner-label"
            style={{
              color: variant === 'white' ? '#fff' : '#64748b',
              fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.9
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  // Simple fallback spinner using CSS only
  return (
    <div
      className={`simple-spinner ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        border: `3px solid #e2e8f0`,
        borderTop: `3px solid ${colors.before}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        ...style
      }}
    />
  );
};

export default Spinner;
