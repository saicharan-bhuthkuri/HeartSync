'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Calendar, BookOpen, Sparkles, MapPin, ChevronDown, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface FloatingHeart {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
}

export default function LandingPage() {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [heartCount, setHeartCount] = useState(0);

  // Spawns interactive hearts on landing page hero mockup
  const spawnHearts = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newHearts = Array.from({ length: 12 }).map((_, i) => ({
      id: heartCount + i,
      x: Math.random() * 80 + 10, // Left offset percentage
      size: Math.random() * 22 + 12,
      delay: Math.random() * 0.3,
      duration: Math.random() * 2 + 1.8,
    }));
    setHeartCount(prev => prev + 12);
    setHearts(prev => [...prev, ...newHearts]);

    // Clean up
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
    }, 3500);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-linear-to-b from-[#fefaf8] via-[#fffbfd] to-[#fdf4f6] text-[#3a1e22] scroll-smooth">
      {/* Glow Backdrop Accents */}
      <div className="absolute top-[-10%] left-[-15%] w-[65vw] h-[65vw] bg-pink-200/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-15%] w-[60vw] h-[60vw] bg-amber-100/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[25%] left-[35%] w-[40vw] h-[40vw] bg-rose-200/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Hearts particle emitter */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="absolute bottom-0 text-pink-500/80 animate-float"
            style={{
              left: `${h.x}%`,
              fontSize: `${h.size}px`,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`,
              opacity: 0,
              animationName: 'float',
            }}
          >
            ❤
          </div>
        ))}
      </div>

      {/* Sticky Header Nav */}
      <header className="w-full px-6 py-5 max-w-6xl mx-auto flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-2 text-rose-500">
          <div className="h-10 w-10 rounded-2xl bg-rose-500/5 flex items-center justify-center text-pink-650 shadow-xs border border-rose-500/10">
            <Heart className="h-5.5 w-5.5 fill-current animate-pulse text-pink-500" />
          </div>
          <span className="font-serif italic font-extrabold text-2xl tracking-tight bg-linear-to-r from-pink-650 via-rose-600 to-amber-600 bg-clip-text text-transparent">
            HeartSync
          </span>
        </div>
        
        <div className="flex items-center space-x-2.5">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs text-zinc-600 hover:text-pink-600 font-bold rounded-full px-4.5">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="text-xs shadow-md shadow-pink-500/10 px-5 rounded-full font-black uppercase tracking-wider border-0 bg-linear-to-r from-pink-500 to-rose-450 hover:from-pink-600 hover:to-rose-550 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-8 md:pt-14 pb-20 relative z-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 space-y-8 text-left max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-widest shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>A Private Diary For Two</span>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-extrabold tracking-tight leading-[1.05] text-[#3a1e22]">
                Your Relationship,<br />
                <span className="font-serif italic font-normal bg-linear-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  Beautifully Scrapbooked
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-medium">
                Keep the sparks alive in your private digital scrapbook. Calculate days together, countdown to upcoming milestones, catalog memory notes, and schedule sweet notification reminders.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full py-4 text-sm font-black uppercase tracking-wider rounded-full shadow-lg shadow-pink-500/15">
                  Create Your Scrapbook
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full py-4 text-sm font-bold bg-white/50 border-rose-100/70 text-zinc-700 rounded-full hover:bg-white/80">
                  Access Space
                </Button>
              </Link>
            </div>

            {/* Trust Badge */}
            <p className="text-[11px] text-zinc-400 font-semibold pl-1 flex items-center">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Strictly private couples space. Safe & personal.
            </p>
          </div>

          {/* Right Column: Layered 3D Card Stack (Fannable on hover of container) */}
          <div className="lg:col-span-6 relative h-[480px] w-full flex items-center justify-center mt-6 lg:mt-0 select-none group">
            
            {/* 1. Back Left Card: The Memory Journal (Polaroid frame with skewed rotation) */}
            <div className="absolute left-4 top-8 w-[250px] -rotate-6 group-hover:-rotate-12 group-hover:translate-x-[-25px] group-hover:translate-y-[-10px] hover:rotate-0! hover:scale-105! hover:z-35! transition-all duration-500 z-10">
              <div className="polaroid-frame relative">
                <div className="washi-tape" />
                <div className="bg-[#FAF3F0] w-full aspect-square mb-3 overflow-hidden rounded-xs flex flex-col items-center justify-center text-rose-300 border border-[#f0e6e2]">
                  <BookOpen className="h-10 w-10 text-rose-400/70 animate-pulse" />
                </div>
                <div className="px-1 text-left">
                  <h4 className="font-serif italic text-sm font-black text-zinc-800">Stargazing in July</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-normal pl-2 border-l border-rose-300 font-medium">
                    "We laid out a blanket and counted stars. I knew right then..."
                  </p>
                  <div className="text-[9px] text-zinc-400 text-right mt-3 font-semibold">July 24, 2025</div>
                </div>
              </div>
            </div>

            {/* 2. Middle Central Card: Days Counter Orb (Click Heart to Spawn particles!) */}
            <div className="absolute w-[285px] z-20 hover:scale-105! transition-all duration-500">
              <Card variant="glass" className="p-6 text-center border-rose-500/15 bg-white/90 shadow-xl shadow-rose-500/5 rounded-[36px] relative animate-breath">
                
                {/* Heart click generator */}
                <button
                  onClick={spawnHearts}
                  className="absolute top-4 right-4 p-2 rounded-full bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 hover:scale-110 active:scale-90 transition-all cursor-pointer shadow-xs"
                  title="Click for love!"
                >
                  <Heart className="h-4.5 w-4.5 fill-current animate-pulse text-pink-500" />
                </button>

                <div className="flex items-center justify-center space-x-[-8px] mb-4">
                  <div className="h-10.5 w-10.5 rounded-full bg-linear-to-tr from-pink-400 to-rose-450 border-2 border-white flex items-center justify-center font-bold text-xs text-white">A</div>
                  
                  {/* Central interactive spawner node */}
                  <div 
                    onClick={spawnHearts}
                    className="z-10 h-8 w-8 rounded-full bg-white border border-rose-100 text-rose-500 flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 active:scale-90 transition-transform"
                    title="Click me!"
                  >
                    <Heart className="h-4 w-4 fill-current text-rose-400" />
                  </div>

                  <div className="h-10.5 w-10.5 rounded-full bg-linear-to-tr from-amber-400 to-rose-450 border-2 border-white flex items-center justify-center font-bold text-xs text-white">C</div>
                </div>

                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Together For</span>
                <div className="text-4xl md:text-5xl font-serif italic font-extrabold tracking-normal bg-linear-to-r from-pink-650 to-amber-600 bg-clip-text text-transparent leading-none py-2">
                  1,248 DAYS
                </div>
                <p className="text-[10px] text-zinc-500 font-bold mt-1">
                  ✨ 3 Years, 5 Months, and 2 Days
                </p>
              </Card>
            </div>

            {/* 3. Front Right Card: Timeline Milestone (Polaroid style with washi tape) */}
            <div className="absolute right-4 bottom-8 w-[250px] rotate-6 group-hover:rotate-12 group-hover:translate-x-[25px] group-hover:translate-y-[10px] hover:rotate-0! hover:scale-105! hover:z-35! transition-all duration-500 z-10">
              <div className="polaroid-frame relative">
                <div className="washi-tape-gold" />
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block text-[8px] font-extrabold uppercase tracking-wide bg-rose-50 text-rose-600 px-2 py-0.5 rounded-sm">
                    🌹 First Date
                  </span>
                  <span className="text-[9px] text-zinc-400 font-semibold">June 8, 2024</span>
                </div>
                <h4 className="font-serif italic text-xs font-bold text-zinc-800">Our First Meeting 🤝</h4>
                <p className="text-[10px] text-zinc-550 mt-1.5 leading-normal">
                  Ordered a Matcha and spilled my Espresso. The start of everything.
                </p>
                <div className="flex items-center space-x-1 mt-3 text-rose-500 text-[9px] font-bold">
                  <MapPin className="h-3 w-3" />
                  <span>The French Roast Cafe</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bouncing Scroll indicator */}
        <div className="flex justify-center pt-8 md:pt-14 animate-bounce">
          <a href="#features" className="p-2.5 rounded-full border border-rose-500/10 bg-white/40 text-rose-500 hover:bg-white/60 transition-colors">
            <ChevronDown className="h-5 w-5" />
          </a>
        </div>

        {/* Features Highlights Grid Section */}
        <div id="features" className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 md:pt-24 max-w-4xl w-full mx-auto text-left">
          {[
            {
              icon: Heart,
              title: 'Duration Calculator',
              desc: 'Detailed counter in years, months, and days, capturing the precise timeline of your love story.',
            },
            {
              icon: Calendar,
              title: 'Anniversary Timelines',
              desc: 'Custom visual vertical milestones of first chats, meetings, dates, and custom milestones.',
            },
            {
              icon: BookOpen,
              title: 'Memory Journal',
              desc: 'Searchable diary letters and photo links linked directly to timeline events, kept private and secure.',
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card
                key={idx}
                variant="glass"
                className="p-6 text-left flex flex-col justify-between space-y-4 border-rose-500/5 hover:border-rose-500/20 transition-all duration-300 shadow-xs rounded-[32px] bg-white/45 relative overflow-hidden"
              >
                <div className="p-3 rounded-2xl bg-rose-500/5 text-rose-600 w-11 h-11 flex items-center justify-center shadow-xs">
                  <Icon className="h-5.5 w-5.5 text-pink-500" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif italic font-bold text-base text-[#3a1e22]">{feat.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">{feat.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-xs text-zinc-400 border-t border-rose-500/5 relative z-10 bg-white/10 backdrop-blur-xs">
        <p>© {new Date().getFullYear()} HeartSync. Built with love for couples everywhere.</p>
      </footer>
    </div>
  );
}
