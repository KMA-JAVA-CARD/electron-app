import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, className, ...props }, ref) => {
    return (
      <div className={clsx('space-y-2', className)}>
        {label && <label className='text-sm text-slate-400'>{label}</label>}
        <div className='relative'>
          {Icon && (
            <Icon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full bg-slate-800 border rounded-xl py-2.5 text-slate-100 placeholder:text-slate-600 outline-none transition-colors border-slate-700',
              Icon ? 'pl-10 pr-4' : 'px-4',
              error ? 'border-red-500 focus:border-red-500' : 'focus:border-emerald-500',
            )}
            {...props}
          />
        </div>
        {error && <p className='text-xs text-red-500'>{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
