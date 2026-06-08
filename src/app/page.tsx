'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Calendar, BookOpen, Sparkles, ChevronRight, MessageSquare, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-b from-[#fefafb] via-[#fff8f9] to-[#fdf4f7] text-[#2d181c]">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[65vw] h-[65vw] bg-rose-200/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-15%] w-[60vw] h-[60vw] bg-pink-200/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[25%] left-[35%] w-[40vw] h-[40vw] bg-amber-200/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Header Navigation */}
      <header className="w-full px-6 py-5 max-w-6xl mx-auto flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-2 text-rose-600">
          <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 shadow-sm border border-rose-500/10">
            <Heart className="h-5 w-5 fill-current animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-rose-600 via-pink-650 to-amber-600 bg-clip-text text-transparent">
            HeartSync
          </span>
        </div>
        
        <div className="flex items-center space-x-2.5">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs text-zinc-550 hover:text-rose-600 font-semibold rounded-full px-4">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="text-xs shadow-md shadow-rose-500/10 px-5 rounded-full font-bold">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 space-y-8 text-left max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/5 border border-rose-500/10 text-rose-600 text-xs font-black uppercase tracking-widest animate-breath">
              <Sparkles className="h-3.5 w-3.5 text-rose-500" />
              <span>Write Your Love in the Stars</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.98] text-[#2d181c]">
                Your Relationship,<br />
                <span className="bg-linear-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                  Beautifully Tracked
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-550 leading-relaxed font-semibold">
                HeartSync coordinates your shared history. Calculate days together, countdown to anniversaries, catalog memory notes, and schedule custom notifications.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full py-4 text-sm font-black uppercase tracking-wider rounded-full shadow-lg shadow-rose-500/15">
                  Create Your Space
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full py-4 text-sm font-bold bg-white/40 border-rose-100/50 text-zinc-700 hover:text-rose-600 rounded-full">
                  Access Space
                </Button>
              </Link>
            </div>

            {/* Small Trust indicator */}
            <p className="text-[11px] text-zinc-400 font-medium pl-1">
              ✨ Strictly private couples spaces. Fully secure & personal.
            </p>
          </div>

          {/* Right Column: Layered Interactive 3D Card Stack */}
          <div className="lg:col-span-6 relative h-[480px] w-full flex items-center justify-center mt-6 lg:mt-0 select-none">
            
            {/* 1. Back Left Card: The Memory Journal */}
            <div className="absolute left-4 top-8 w-[250px] rotate-[-8deg] transform hover:rotate-0 hover:-translate-y-2 hover:z-30 transition-all duration-500 z-10">
              <Card variant="glass" className="p-4 bg-white/80 border-rose-500/10 shadow-lg shadow-rose-500/5 rounded-3xl">
                <div className="flex items-center space-x-2 mb-2 text-rose-500">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Memory Letter</span>
                </div>
                <h4 className="text-xs font-black text-zinc-850">Stargazing in July</h4>
                <p className="text-[10px] text-zinc-500 mt-1 leading-normal italic pl-1 border-l-2 border-rose-400">
                  "We laid out a blanket and counted the falling stars. I knew right then..."
                </p>
                <div className="text-[9px] text-zinc-400 text-right mt-3 font-semibold">July 24, 2025</div>
              </Card>
            </div>

            {/* 2. Middle Central Card: Days Counter Orb */}
            <div className="absolute w-[280px] z-20 hover:scale-105 transition-transform duration-500">
              <Card variant="glass" className="p-6 text-center border-rose-500/15 bg-white/85 shadow-xl shadow-rose-500/8 rounded-[36px] relative animate-breath">
                
                {/* Micro heart decoration */}
                <div className="absolute top-4 right-4 text-rose-500 animate-pulse">
                  <Heart className="h-4 w-4 fill-current" />
                </div>

                <div className="flex items-center justify-center space-x-[-8px] mb-4">
                  <div className="h-10 w-10 rounded-full bg-linear-to-tr from-rose-400 to-pink-500 border-2 border-white flex items-center justify-center font-black text-xs text-white">A</div>
                  <div className="h-6 w-6 rounded-full bg-white border border-rose-100 text-rose-500 flex items-center justify-center shadow-xs"><Heart className="h-3 w-3 fill-current" /></div>
                  <div className="h-10 w-10 rounded-full bg-linear-to-tr from-amber-400 to-rose-450 border-2 border-white flex items-center justify-center font-black text-xs text-white">S</div>
                </div>

                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Together For</span>
                <div className="text-4xl md:text-5xl font-black tracking-tighter bg-linear-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent font-mono leading-none py-1">
                  1,248 DAYS
                </div>
                <p className="text-[10px] text-zinc-550 font-bold mt-1">
                  ✨ 3 Years, 5 Months, and 2 Days
                </p>
              </Card>
            </div>

            {/* 3. Front Right Card: Timeline Milestone */}
            <div className="absolute right-4 bottom-8 w-[260px] rotate-[8deg] transform hover:rotate-0 hover:-translate-y-2 hover:z-30 transition-all duration-500 z-10">
              <Card variant="glass" className="p-4 bg-white/80 border-rose-500/10 shadow-lg shadow-rose-500/5 rounded-3xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wide bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    🌹 First Date
                  </span>
                  <span className="text-[9px] text-zinc-400 font-semibold">June 8, 2024</span>
                </div>
                <h4 className="text-xs font-black text-zinc-850">Our First Meeting 🤝</h4>
                <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                  Ordered a Matcha and spilled my Espresso. The start of everything.
                </p>
                <div className="flex items-center space-x-1 mt-3 text-rose-500 text-[9px] font-bold">
                  <MapPin className="h-3 w-3" />
                  <span>The French Roast Cafe</span>
                </div>
              </Card>
            </div>

          </div>
        </div>

        {/* Features Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 max-w-4xl w-full text-left">
          {[
            {
              icon: Heart,
              title: 'Days Counter',
              desc: 'Detailed duration counter in years, months, and days, capturing the depth of your shared timeline.',
            },
            {
              icon: Calendar,
              title: 'Anniversaries Timeline',
              desc: 'Custom gradient visual timeline of first chats, meetings, dates, and custom milestones.',
            },
            {
              icon: BookOpen,
              title: 'Private Journal',
              desc: 'Searchable diary letters and photos linked directly to timeline events, kept private and secure.',
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card
                key={idx}
                variant="glass"
                className="p-6 text-left flex flex-col justify-between space-y-4 border-rose-500/5 hover:border-rose-500/25 transition-all duration-300 shadow-sm shadow-rose-500/2 rounded-[32px] bg-white/45"
              >
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 w-11 h-11 flex items-center justify-center shadow-xs">
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base text-[#2d181c]">{feat.title}</h3>
                  <p className="text-xs text-zinc-550 leading-relaxed font-medium">{feat.desc}</p>
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
