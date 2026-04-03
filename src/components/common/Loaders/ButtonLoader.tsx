import React from 'react';
import Spinner from './Spinner';
import './loaderStyles.css';

export interface ButtonLoaderProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Loading state */
  loading?: boolean;
  /** Button content when not loading */
  children: React.ReactNode;
  /** Text to show while loading (default: 'Loading...') */
  loadingText?: string;
  /** Button variant/appearance */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Size of button */
  size?: 'sm' | 'md' | 'lg';
  /** Disable button when loading (default: true) */
  disableWhenLoading?: boolean;
  /** Spinner size inside button */
  spinnerSize?: 'sm' | 'md';
  /** Show spinner only (no text change) */
  spinnerOnly?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * ButtonLoader
 * Button component with built-in loading state management.
 * Automatically disables button and shows spinner while loading.
 *
 * Usage:
 * ```tsx
 * <ButtonLoader
 *   loading={submitting}
 *   onClick={handleSubmit}
 *   className="btn-primary"
 * >
 *   Save Changes
 * </ButtonLoader>
 * ```
 */
const ButtonLoader: React.FC<ButtonLoaderProps> = ({
  loading = false,
  children,
  loadingText = 'Loading...',
  variant = 'primary',
  size = 'md',
  disableWhenLoading = true,
  spinnerSize = 'sm',
  spinnerOnly = false,
  fullWidth = false,
  className = '',
  style = {},
  disabled,
  onClick,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: size === 'sm' ? '0.375rem 0.75rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.5rem 1rem',
    borderRadius: '6px',
    fontWeight: 500,
    fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1rem' : '0.9rem',
    cursor: (disableWhenLoading && loading) || disabled ? 'not-allowed' : 'pointer',
    opacity: (disableWhenLoading && loading) || disabled ? 0.6 : 1,
    border: 'none',
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    minHeight: size === 'sm' ? '32px' : size === 'lg' ? '44px' : '38px',
    ...style
  };

  const variantStyles = {
    primary: {
      background: '#0d9488',
      color: '#ffffff',
      border: '1px solid #0d9488'
    },
    secondary: {
      background: '#f8fafc',
      color: '#0d5f68',
      border: '1px solid #0d5f68'
    },
    danger: {
      background: '#ef4444',
      color: '#ffffff',
      border: '1px solid #ef4444'
    },
    ghost: {
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #e2e8f0'
    }
  };

  return (
    <button
      className={`btn-loader ${className}`}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      disabled={disabled || (disableWhenLoading && loading)}
      onClick={onClick}
      {...props}
    >
      {loading && !spinnerOnly && (
        <Spinner size={spinnerSize} variant={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
      )}
      {loading && spinnerOnly ? (
        <Spinner size={spinnerSize} variant={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
      ) : (
        <span>{loading ? loadingText : children}</span>
      )}
    </button>
  );
};

export default ButtonLoader;
