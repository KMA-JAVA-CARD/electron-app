import { useState, useRef, useEffect, useLayoutEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}

export const Popover = ({ trigger, children, align = 'right' }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Calculate position synchronously before paint using useLayoutEffect
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 160;

      setPosition({
        top: rect.bottom + 4,
        left: align === 'right' ? rect.right - popoverWidth : rect.left,
      });
    } else {
      setPosition(null);
    }
  }, [isOpen, align]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className='inline-block'>
        {trigger}
      </div>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={popoverRef}
            className='fixed z-100 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 min-w-[160px] overflow-hidden'
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
};

// Popover Menu Item
interface PopoverMenuItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

export const PopoverMenuItem = ({
  icon,
  children,
  onClick,
  variant = 'default',
}: PopoverMenuItemProps) => (
  <button
    onClick={onClick}
    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
      variant === 'danger'
        ? 'text-red-400 hover:bg-red-500/10'
        : 'text-slate-300 hover:bg-slate-700'
    }`}
  >
    {icon}
    {children}
  </button>
);

// Popover Divider
export const PopoverDivider = () => <div className='border-t border-slate-700 my-1' />;
