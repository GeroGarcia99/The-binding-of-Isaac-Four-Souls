import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label className="text-xs font-medium text-stone-300 tracking-wide uppercase font-mono">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-stone-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-stone-900/90 text-stone-100 placeholder:text-stone-500 border rounded-lg px-4 py-3 min-h-[46px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
              icon ? 'pl-11' : ''
            } ${
              error
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-stone-700/80 focus:border-amber-500/80'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-stone-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
