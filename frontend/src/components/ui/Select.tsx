import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
  tooltip?: string;
  description?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, error, placeholder, tooltip, description, id, ...props }, ref) => {
    
    const selectId = id || React.useId();

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Label */}
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 flex items-center">
            {label}
            {tooltip && <span className="ml-1 text-slate-400 font-normal cursor-help" title={tooltip}>(?)</span>}
          </label>
        )}

        {/* Description */}
        {description && <p className="text-xs text-slate-500 mb-1">{description}</p>}

        <div className="relative flex rounded-md shadow-sm">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "block w-full min-w-0 flex-1 rounded-md px-4 py-2.5 sm:text-sm transition-colors",
              "border outline-none appearance-none bg-no-repeat bg-[right_1rem_center]",
              error 
                ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50" 
                : "border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white",
              className
            )}
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em' }}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-xs text-red-600 font-medium animate-in fade-in" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
