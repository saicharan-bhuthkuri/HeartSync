'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles } from 'lucide-react';
import { useApp } from '@/components/AppContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const { setUser } = useApp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    email2: '',
    password: '',
    partnerName1: '',
    partnerName2: '',
    relationshipStartDate: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          email2: formData.email2,
          password: formData.password,
          partnerName1: formData.partnerName1,
          partnerName2: formData.partnerName2 || null,
          relationshipStartDate: formData.relationshipStartDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      setUser(data.user);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative min-h-screen bg-linear-to-b from-[#fefaf8] to-[#fdf4f6] text-[#3a1e22]">
      {/* Light Glow Ambient Orbs */}
      <div className="absolute top-[20%] right-[20%] w-[45vw] h-[45vw] bg-rose-200/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[20%] w-[45vw] h-[45vw] bg-pink-200/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center relative z-10">
        <div className="h-12 w-12 rounded-2xl bg-rose-500/5 flex items-center justify-center text-pink-500 shadow-md border border-rose-500/10 animate-bounce">
          <Heart className="h-6 w-6 fill-current animate-pulse" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif italic font-extrabold tracking-tight text-[#3a1e22] flex items-center justify-center">
          <Sparkles className="h-5 w-5 mr-2 text-rose-500" /> Start HeartSync Space
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500 font-medium">
          Begin tracking your shared history today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card variant="glass" className="py-8 px-4 sm:px-10 border-rose-500/10 bg-white/80 backdrop-blur-md shadow-lg shadow-rose-500/5 rounded-[32px] relative overflow-hidden">
          <div className="washi-tape-gold" />
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-650">
                {error}
              </div>
            )}

            <Input
              label="Email (Partner 1)"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="partner1@example.com"
              autoComplete="email"
            />

            <Input
              label="Email (Partner 2)"
              name="email2"
              type="email"
              required
              value={formData.email2}
              onChange={handleChange}
              placeholder="partner2@example.com"
              autoComplete="email"
            />

            <Input
              label="Shared Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Your Name"
                name="partnerName1"
                type="text"
                required
                value={formData.partnerName1}
                onChange={handleChange}
                placeholder="Partner 1"
              />
              <Input
                label="Partner Name"
                name="partnerName2"
                type="text"
                value={formData.partnerName2}
                onChange={handleChange}
                placeholder="Partner 2"
              />
            </div>

            <Input
              label="Relationship Start Date"
              name="relationshipStartDate"
              type="date"
              required
              value={formData.relationshipStartDate}
              onChange={handleChange}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-3 rounded-2xl font-extrabold tracking-wide uppercase shadow-lg shadow-pink-500/10 border-0 bg-linear-to-r from-pink-500 to-rose-450 hover:from-pink-600 hover:to-rose-550 text-white"
                isLoading={isLoading}
              >
                Start Journey
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-500 font-medium">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-rose-600 hover:text-rose-500 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
