import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface InputWithUnitProps extends InputHTMLAttributes<HTMLInputElement> {
  unit?: string;
  error?: string;
  label: string;
  description?: string;
  tooltip?: string;
}

const InputWithUnit = forwardRef<HTMLInputElement, InputWithUnitProps>(
  ({ className, unit, error, label, description, tooltip, id, ...props }, ref) => {
    
    // Auto-generate ID if needed for accessibility
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Label */}
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 flex items-center">
          {label}
          {tooltip && <span className="ml-1 text-slate-400 font-normal cursor-help" title={tooltip}>(?)</span>}
        </label>
        
        {/* Description (Assumptions or context) */}
        {description && <p className="text-xs text-slate-500 mb-1">{description}</p>}
        
        {/* Input Wrapper */}
        <div className="relative flex rounded-md shadow-sm">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "block w-full min-w-0 flex-1 rounded-none rounded-l-md border-r-0 px-4 py-2.5 sm:text-sm transition-colors",
              "border outline-none",
              error 
                ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50" 
                : "border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white",
              className
            )}
            {...props}
          />
          {/* Unit Suffix */}
          {unit && (
            <span 
              className={cn(
                 "inline-flex items-center rounded-r-md border border-l-0 px-3 text-slate-500 sm:text-sm font-mono bg-slate-50",
                 error ? "border-red-300" : "border-slate-300"
              )}
            >
              {unit}
            </span>
          )}
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

InputWithUnit.displayName = 'InputWithUnit';

export { InputWithUnit };
