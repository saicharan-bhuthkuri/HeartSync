import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-rose-brand hover:bg-rose-brand-hover text-white shadow-sm shadow-rose-500/10 hover:shadow-md hover:shadow-rose-500/20 active:scale-98',
    secondary: 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-300 active:scale-98',
    outline: 'border border-zinc-200 hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-900/60 dark:text-zinc-200 active:scale-98',
    ghost: 'hover:bg-zinc-100 text-zinc-700 dark:hover:bg-zinc-900 dark:text-zinc-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-98',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
}
