import { useState, useRef, useLayoutEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  maxWidth?: number;
  position?: 'top' | 'bottom';
}

export const Tooltip = ({ content, children, maxWidth = 300, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom';
  } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipHeight = 60; // Approximate max height
      const gap = 8;

      // Check if there's enough space above
      const spaceAbove = rect.top;
      const shouldPlaceBelow = position === 'bottom' || spaceAbove < tooltipHeight + gap;

      if (shouldPlaceBelow) {
        setCoords({
          top: rect.bottom + gap,
          left: rect.left,
          placement: 'bottom',
        });
      } else {
        setCoords({
          top: rect.top - gap,
          left: rect.left,
          placement: 'top',
        });
      }
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className='inline-block'
      >
        {children}
      </div>

      {isVisible &&
        coords &&
        content &&
        createPortal(
          <div
            className='fixed z-100 px-3 py-2 bg-slate-700 text-slate-200 text-sm rounded-lg shadow-xl border border-slate-600 pointer-events-none'
            style={{
              top: coords.placement === 'top' ? undefined : coords.top,
              bottom: coords.placement === 'top' ? `calc(100vh - ${coords.top}px)` : undefined,
              left: coords.left,
              maxWidth,
            }}
          >
            {content}
            {/* Arrow */}
            {coords.placement === 'top' ? (
              <div className='absolute left-4 -bottom-1.5 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-700' />
            ) : (
              <div className='absolute left-4 -top-1.5 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-slate-700' />
            )}
          </div>,
          document.body,
        )}
    </>
  );
};

// Truncated text component with tooltip
interface TruncatedTextProps {
  text: string | null | undefined;
  lines?: number;
  className?: string;
}

export const TruncatedText = ({ text, lines = 2, className = '' }: TruncatedTextProps) => {
  if (!text) return <span className={className}>-</span>;

  return (
    <Tooltip content={text}>
      <span
        className={`block ${className}`}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
};
