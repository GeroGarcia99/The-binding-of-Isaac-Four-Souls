import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 whitespace-nowrap active:scale-[0.98]';

  const sizeStyles = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs gap-1.5',
    md: 'min-h-[44px] px-5 py-2.5 text-sm gap-2',
    lg: 'min-h-[52px] px-6 py-3.5 text-base font-semibold gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-950/40 border border-amber-400/40 hover:shadow-amber-500/20',
    secondary:
      'bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700/70 hover:border-stone-600 shadow-sm shadow-black/40',
    danger:
      'bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 shadow-sm',
    ghost:
      'bg-transparent hover:bg-stone-800/60 text-stone-300 hover:text-stone-100 border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
