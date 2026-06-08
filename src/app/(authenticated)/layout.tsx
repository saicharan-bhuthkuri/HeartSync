'use client';

import React from 'react';
import { useApp } from '@/components/AppContext';
import { Navbar } from '@/components/Navbar';
import { Heart } from 'lucide-react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full bg-rose-500/20 animate-ping" />
          <div className="relative h-12 w-12 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Heart className="h-6 w-6 fill-current animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-rose-500 uppercase animate-pulse">
          Syncing Hearts...
        </p>
      </div>
    );
  }

  // Fallback: If not logged in and loading is complete, middleware will redirect.
  // We return a loading placeholder here just in case.
  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
