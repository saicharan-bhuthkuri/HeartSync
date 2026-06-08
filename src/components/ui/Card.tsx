import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-3xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 overflow-hidden';
  
  const variants = {
    default: 'shadow-sm shadow-zinc-100/40 dark:shadow-none',
    glass: 'glass-panel',
    interactive: 'glass-panel glass-panel-hover cursor-pointer',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`${variant === 'default' ? baseStyles : ''} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
