'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { CountdownTimer } from '@/components/relationship/CountdownTimer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Calendar, Book, ChevronRight, AlertCircle, Award, Sparkles } from 'lucide-react';

interface DashboardData {
  stats: {
    duration: {
      years: number;
      months: number;
      days: number;
      totalDays: number;
    };
    totalMilestones: number;
    totalMemories: number;
  };
  nextEvent: {
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    upcomingDate: string;
    daysRemaining: number;
    description?: string;
  } | null;
  onThisDay: {
    milestones: any[];
    memories: any[];
  };
}

interface FlyingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function DashboardPage() {
  const { user } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive floating hearts state
  const [flyingHearts, setFlyingHearts] = useState<FlyingHeart[]>([]);
  const [heartCounter, setHeartCounter] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        throw new Error('Failed to load dashboard data');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Trigger floating hearts micro-animation
  const triggerHearts = () => {
    const newHearts: FlyingHeart[] = Array.from({ length: 20 }).map((_, i) => ({
      id: heartCounter + i,
      x: Math.random() * 85 + 7.5, // drift range
      y: 100,
      size: Math.random() * 24 + 14, // 14px to 38px
      delay: Math.random() * 0.5,
      duration: Math.random() * 2 + 1.8,
    }));
    
    setHeartCounter(prev => prev + 20);
    setFlyingHearts(prev => [...prev, ...newHearts]);

    // Clean up
    setTimeout(() => {
      setFlyingHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
    }, 4000);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-5xl mx-auto">
        <div className="h-80 bg-rose-100/10 rounded-[40px] border border-rose-500/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-56 bg-zinc-100/10 rounded-3xl col-span-2" />
          <div className="h-56 bg-zinc-100/10 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">Failed to sync dashboard</h3>
        <p className="text-zinc-500 text-sm mt-2">{error}</p>
        <Button onClick={fetchDashboardData} className="mt-6" variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  const stats = data?.stats;
  const nextEvent = data?.nextEvent;
  const onThisDay = data?.onThisDay;

  const formatFriendlyDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      first_chat: '💬 First Chat',
      first_call: '📞 First Call',
      first_meeting: '🤝 First Meeting',
      first_date: '🌹 First Date',
      proposal: '💍 Proposal Day',
      anniversary: '💖 Anniversary',
      birthday: '🎂 Birthday',
      custom: '✨ Special Event',
    };
    return types[type] || '✨ Event';
  };

  return (
    <div className="space-y-6 md:space-y-10 max-w-5xl mx-auto pb-10">
      {/* Floating Hearts overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {flyingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute bottom-0 text-pink-500/95 animate-float"
            style={{
              left: `${heart.x}%`,
              fontSize: `${heart.size}px`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              opacity: 0,
              animationName: 'float',
            }}
          >
            ❤
          </div>
        ))}
      </div>

      {/* 1. HERO VISUAL - DAYS TOGETHER ORB */}
      <Card variant="glass" className="relative p-8 md:p-12 text-center flex flex-col items-center justify-center overflow-hidden border-rose-500/10 shadow-xl rounded-[40px] bg-white/60">
        
        {/* Particle spawner button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={triggerHearts}
            className="p-3.5 rounded-full bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Send Hearts"
          >
            <Heart className="h-5.5 w-5.5 fill-current animate-pulse text-pink-500" />
          </button>
        </div>

        {/* Partners Avatar Rings */}
        <div className="flex items-center justify-center space-x-[-12px] md:space-x-[-18px] mb-6 relative">
          {user?.avatarUrl1 ? (
            <img src={user.avatarUrl1} alt={user.partnerName1} className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-white object-cover shadow-md" />
          ) : (
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-white bg-linear-to-tr from-pink-400 to-rose-450 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-md">
              {user?.partnerName1[0]?.toUpperCase()}
            </div>
          )}

          {/* Central Heart Link */}
          <div className="z-10 h-9.5 w-9.5 rounded-full bg-white border border-rose-100 flex items-center justify-center shadow-md animate-heartbeat">
            <Heart className="h-4.5 w-4.5 text-pink-500 fill-pink-500" />
          </div>

          {user?.partnerName2 ? (
            user.avatarUrl2 ? (
              <img src={user.avatarUrl2} alt={user.partnerName2} className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-white object-cover shadow-md" />
            ) : (
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-white bg-linear-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-md">
                {user.partnerName2[0]?.toUpperCase()}
              </div>
            )
          ) : (
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-white bg-zinc-200 text-zinc-505 flex items-center justify-center font-bold text-lg md:text-xl shadow-md">
              +
            </div>
          )}
        </div>

        <div className="space-y-4 max-w-xl">
          <h2 className="text-zinc-400 font-extrabold uppercase tracking-widest text-[10px] md:text-xs">
            Days Together
          </h2>

          {/* Concentric Rose Gold Badge Medallion Frame */}
          <div className="inline-flex items-center justify-center p-1 rounded-full border-4 border-dashed border-rose-200 bg-linear-to-tr from-pink-50/50 to-amber-50/50">
            <div className="py-5 px-10 rounded-full bg-white border border-rose-100/60 shadow-lg shadow-pink-500/2">
              <span className="text-5xl md:text-7xl font-serif italic font-extrabold tracking-normal bg-linear-to-r from-pink-650 to-amber-600 bg-clip-text text-transparent leading-none drop-shadow-xs">
                {stats?.duration.totalDays.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-lg md:text-xl font-serif italic font-extrabold text-[#3a1e22]">
            ✨ {stats?.duration.years} Years, {stats?.duration.months} Months, and {stats?.duration.days} Days
          </p>

          <p className="text-xs text-zinc-400 flex items-center justify-center space-x-2 font-medium">
            <span>Started: {formatFriendlyDate(user?.relationshipStartDate || '')}</span>
            <span>•</span>
            <span className="font-bold text-pink-600 uppercase tracking-wider">
              {user?.partnerName1} {user?.partnerName2 ? `& ${user.partnerName2}` : ''}
            </span>
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2. UPCOMING MILESTONE COUNTDOWN */}
        <Card variant="glass" className="md:col-span-2 flex flex-col justify-between p-6 border-rose-500/5 bg-white/60 relative overflow-hidden">
          <div className="washi-tape-gold" />
          <div className="pt-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center">
                <Award className="h-4.5 w-4.5 mr-2 text-rose-500" /> Next Milestone
              </h3>
              {nextEvent && (
                <span className="text-[10px] md:text-xs bg-rose-50 text-rose-650 px-3 py-1 rounded-full font-bold tracking-wide uppercase border border-rose-100">
                  {nextEvent.daysRemaining} days left
                </span>
              )}
            </div>

            {nextEvent ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-3 text-left">
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wide bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-sm border border-rose-100/50">
                    {getEventTypeLabel(nextEvent.event_type)}
                  </span>
                  <h4 className="text-2xl font-serif italic font-extrabold text-zinc-900 leading-snug pt-1">
                    {nextEvent.title}
                  </h4>
                  <p className="text-xs text-zinc-550 font-medium">
                    Anniversary date: {formatFriendlyDate(nextEvent.upcomingDate)}
                  </p>
                  {nextEvent.description && (
                    <p className="text-xs text-zinc-650 italic mt-2 line-clamp-2 border-l-2 border-pink-300 pl-2">
                      "{nextEvent.description}"
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-3xl bg-[#fdfaf8] border border-rose-500/5 shadow-xs">
                  <CountdownTimer targetDateStr={nextEvent.upcomingDate} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500 space-y-3">
                <p className="text-sm font-medium">No upcoming milestones cataloged.</p>
                <Link href="/timeline">
                  <Button variant="secondary" size="sm">Add First Milestone</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* 3. QUICK OVERVIEW STATS */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <Card variant="interactive" className="flex flex-col justify-between p-5 border-rose-500/5 bg-white/60 relative overflow-hidden">
            <div className="washi-tape" />
            <div className="flex items-center justify-between pt-2">
              <div className="p-2.5 rounded-2xl bg-rose-500/5 text-rose-600">
                <Calendar className="h-5 w-5 text-pink-500" />
              </div>
              <span className="text-3xl font-serif font-extrabold text-zinc-900">{stats?.totalMilestones}</span>
            </div>
            <div className="pt-4 text-left">
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Milestones</p>
              <Link href="/timeline" className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center mt-1.5 transition-colors">
                View Timeline <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
          </Card>

          <Card variant="interactive" className="flex flex-col justify-between p-5 border-rose-500/5 bg-white/60 relative overflow-hidden">
            <div className="washi-tape-gold" />
            <div className="flex items-center justify-between pt-2">
              <div className="p-2.5 rounded-2xl bg-rose-500/5 text-rose-600">
                <Book className="h-5 w-5 text-pink-500" />
              </div>
              <span className="text-3xl font-serif font-extrabold text-zinc-900">{stats?.totalMemories}</span>
            </div>
            <div className="pt-4 text-left">
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Memories</p>
              <Link href="/journal" className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center mt-1.5 transition-colors">
                View Journal <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. ON THIS DAY SECTION */}
      <Card variant="glass" className="p-6 md:p-8 border-rose-500/5 bg-white/60 relative">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center">
          <Sparkles className="h-4.5 w-4.5 mr-2 text-rose-500" /> On This Day (Past Years)
        </h3>

        {onThisDay && (onThisDay.milestones.length > 0 || onThisDay.memories.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Milestones column */}
            <div className="space-y-4">
              {onThisDay.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="p-4 rounded-3xl bg-[#fdfaf8] border border-rose-500/5 flex items-start space-x-3 shadow-xs hover:border-rose-500/20 transition-all duration-300 text-left"
                >
                  <div className="h-10 w-10 rounded-2xl bg-linear-to-tr from-pink-400 to-rose-450 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-rose-500/10">
                    {milestone.yearsAgo}y
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-rose-600">
                      {getEventTypeLabel(milestone.event_type)}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                      {milestone.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-semibold">
                      {formatFriendlyDate(milestone.event_date)} ({milestone.yearsAgo}y ago{milestone.isExact ? ' today!' : ' around this time'})
                    </p>
                    {milestone.description && (
                      <p className="text-xs text-zinc-600 italic pt-1 border-t border-rose-100/50 mt-2 pl-1">
                        "{milestone.description}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Memories column */}
            <div className="space-y-4">
              {onThisDay.memories.map((memory) => (
                <div
                  key={memory.id}
                  className="p-4 rounded-3xl bg-[#fdfaf8] border border-rose-500/5 flex items-start space-x-3 shadow-xs hover:border-rose-500/20 transition-all duration-300 text-left"
                >
                  <div className="h-10 w-10 rounded-2xl bg-linear-to-tr from-pink-400 to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-pink-500/10">
                    {memory.yearsAgo}y
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-pink-600">
                      📸 Memory Note
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                      {memory.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-semibold">
                      {memory.milestone_title ? `Linked to ${memory.milestone_title} • ` : ''}
                      {formatFriendlyDate(memory.memory_date)}
                    </p>
                    <p className="text-xs text-zinc-600 leading-relaxed pt-1">
                      {memory.notes}
                    </p>
                    {memory.image_url && (
                      <div className="mt-3 rounded-2xl overflow-hidden max-h-48 max-w-xs border border-rose-500/5 shadow-xs">
                        <img src={memory.image_url} alt={memory.title} className="object-cover w-full h-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-rose-150 rounded-3xl text-zinc-500 text-sm max-w-md mx-auto">
            <span className="text-3xl block mb-3 animate-bounce">🎈</span>
            <p className="font-bold text-zinc-700">Create your future anniversaries</p>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-xs mx-auto font-medium">
              No milestones fall on this week. Add milestones or write memory letters, and they will reappear here in future years!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
