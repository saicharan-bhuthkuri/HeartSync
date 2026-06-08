'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: DialogProps) {
  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Dialog Content Container */}
      <div className={`relative w-full ${sizes[size]} glass-panel bg-white/95 dark:bg-zinc-950/95 rounded-3xl p-6 shadow-2xl animate-fade-in-up border border-rose-500/10 dark:border-rose-400/10 z-10`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-900">
          <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
