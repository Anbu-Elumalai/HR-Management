import React from 'react';
import './loaderStyles.css';

export interface DotLoaderProps {
  /** Color of dots */
  color?: string;
  /** Size of each dot */
  size?: number;
  /** Gap between dots */
  gap?: number;
  /** Additional class */
  className?: string;
}

/**
 * DotLoader
 * Small inline loading indicator with bouncing dots.
 * Perfect for inline actions, dropdown loading, etc.
 *
 * Usage:
 * ```tsx
 * <DotLoader color="#0d9488" size={6} gap={4} />
 * ```
 */
const DotLoader: React.FC<DotLoaderProps> = ({
  color = '#0d9488',
  size = 8,
  gap = 6,
  className = ''
}) => {
  return (
    <div
      className={`dots-loader ${className}`}
      style={{
        display: 'inline-flex',
        gap: `${gap}px`,
        alignItems: 'center'
      }}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="dot"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            borderRadius: '50%',
            animation: 'dot-bounce 1.4s ease-in-out infinite both',
            animationDelay: `${-0.32 + index * 0.16}s`
          }}
        />
      ))}
      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DotLoader;
