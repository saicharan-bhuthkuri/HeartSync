import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', containerClassName = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className={`flex flex-col space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400 pl-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all duration-200 text-sm ${
            error ? 'border-red-500 focus:ring-red-400/50 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 pl-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', containerClassName = '', id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className={`flex flex-col space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400 pl-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all duration-200 text-sm resize-none min-h-[100px] ${
            error ? 'border-red-500 focus:ring-red-400/50 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 pl-1">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', containerClassName = '', id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className={`flex flex-col space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400 pl-1"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all duration-200 text-sm ${
            error ? 'border-red-500 focus:ring-red-400/50 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-950">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500 pl-1">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
