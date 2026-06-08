'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, Sparkles } from 'lucide-react';
import { useApp } from '@/components/AppContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function LoginContent() {
  const { setUser } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      setUser(data.user);
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative min-h-screen bg-linear-to-b from-[#fefafb] to-[#fdf5f7] text-[#2d181c]">
      {/* Light Glow Ambient Orbs */}
      <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-rose-200/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] bg-pink-200/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center relative z-10">
        <div className="h-12 w-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 animate-bounce">
          <Heart className="h-6 w-6 fill-current" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-[#2d181c] flex items-center justify-center">
          <Sparkles className="h-5 w-5 mr-2 text-rose-500 animate-pulse" /> Welcome to HeartSync
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-550">
          Enter your private couples space
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card variant="glass" className="py-8 px-4 sm:px-10 border-rose-500/10 bg-white/70 backdrop-blur-md shadow-lg shadow-rose-500/5 rounded-[32px]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-650">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="couple@heartsync.app"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <div>
              <Button
                type="submit"
                className="w-full py-3 rounded-2xl font-extrabold tracking-wide uppercase shadow-md shadow-rose-500/10"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-500">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-bold text-rose-600 hover:text-rose-500 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center py-12 px-4 text-center bg-linear-to-b from-[#fefafb] to-[#fdf5f7] min-h-screen text-[#2d181c]">
        <p className="text-rose-500 font-semibold animate-pulse">Synchronizing Space...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
