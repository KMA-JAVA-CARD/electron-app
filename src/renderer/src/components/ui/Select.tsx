import { SelectHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, ...props }, ref) => {
    return (
      <div className={clsx('space-y-2', className)}>
        {label && <label className='text-sm text-slate-400'>{label}</label>}
        <div className='relative'>
          <select
            ref={ref}
            className={clsx(
              'w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-slate-100 outline-none appearance-none transition-colors border-slate-700',
              error ? 'border-red-500 focus:border-red-500' : 'focus:border-emerald-500',
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className='text-xs text-red-500'>{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
