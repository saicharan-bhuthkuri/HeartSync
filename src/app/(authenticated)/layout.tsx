'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/AppContext';
import { Navbar } from '@/components/Navbar';
import { Heart, Music, X } from 'lucide-react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useApp();
  const [isMusicOpen, setIsMusicOpen] = useState(false);

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

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0 relative">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* Floating Vinyl Music Playlist Player */}
      {user.playlistUrl && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-40 flex flex-col items-end">
          {isMusicOpen && (
            <div className="mb-3 w-[300px] bg-white border border-rose-100 shadow-xl rounded-2xl p-3 animate-fade-in-up relative overflow-hidden">
              <div className="washi-tape-gold" />
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-rose-500/5 mt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center">
                  <Music className="h-3 w-3 mr-1 text-rose-500" /> Our Soundtrack
                </span>
                <button
                  onClick={() => setIsMusicOpen(false)}
                  className="p-0.5 rounded-full hover:bg-rose-500/5 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="rounded-xl overflow-hidden shadow-inner bg-[#fdfaf8] h-[152px]">
                <iframe
                  src={user.playlistUrl}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allowFullScreen={false}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setIsMusicOpen(!isMusicOpen)}
            className={`h-11 w-11 rounded-full bg-linear-to-r from-pink-500 to-rose-450 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
              isMusicOpen ? 'ring-2 ring-rose-400' : ''
            }`}
            title="Our Playlist"
          >
            {isMusicOpen ? (
              <X className="h-5 w-5 animate-pulse" />
            ) : (
              <div className="relative flex items-center justify-center w-full h-full">
                {/* Vinyl record spinning animation decoration */}
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-spin" style={{ animationDuration: '4s' }} />
                <Music className="h-5 w-5 relative z-10" />
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
