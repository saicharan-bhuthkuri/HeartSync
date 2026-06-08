'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, LayoutDashboard, CalendarDays, BookOpen, Settings, LogOut } from 'lucide-react';
import { useApp } from '@/components/AppContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useApp();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Timeline', href: '/timeline', icon: CalendarDays },
    { label: 'Journal', href: '/journal', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  if (!user) return null;

  // Helper to extract initials
  const getInitials = (name1: string, name2: string | null) => {
    const n1 = name1.trim()[0] || '';
    const n2 = name2?.trim()[0] || '';
    return `${n1}${n2 ? '+' + n2 : ''}`.toUpperCase();
  };

  return (
    <>
      {/* Desktop Navigation Top Bar */}
      <header className="sticky top-0 z-40 hidden md:block w-full px-6 py-4">
        <nav className="max-w-6xl mx-auto glass-panel px-6 py-3.5 flex items-center justify-between rounded-full bg-white/85">
          <Link href="/dashboard" className="flex items-center space-x-2 text-rose-500 group">
            <Heart className="h-6 w-6 fill-current group-hover:scale-110 transition-transform animate-pulse text-pink-500" />
            <span className="font-serif italic font-extrabold text-xl tracking-tight bg-linear-to-r from-pink-650 via-rose-600 to-amber-600 bg-clip-text text-transparent">
              HeartSync
            </span>
          </Link>

          <div className="flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-linear-to-r from-pink-500 to-rose-450 text-white shadow-md shadow-pink-500/10'
                      : 'text-zinc-650 hover:bg-rose-500/5 hover:text-pink-650'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Couple Avatars/Initials Badge */}
            <div className="h-8.5 px-3 rounded-full bg-rose-500/5 border border-rose-500/10 text-xs font-bold text-pink-650 flex items-center justify-center shadow-xs">
              {getInitials(user.partnerName1, user.partnerName2)}
            </div>

            <button
              onClick={logout}
              className="p-2.5 rounded-full hover:bg-red-500/5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 md:hidden w-full px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-rose-500/5">
        <Link href="/dashboard" className="flex items-center space-x-1.5 text-rose-500">
          <Heart className="h-5 w-5 fill-current text-pink-500" />
          <span className="font-serif italic font-extrabold text-lg tracking-tight bg-linear-to-r from-pink-650 via-rose-600 to-amber-600 bg-clip-text text-transparent">
            HeartSync
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={logout}
            className="p-2 rounded-full text-zinc-400 hover:text-red-500 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-safe px-4 py-2 bg-white/90 backdrop-blur-lg border-t border-rose-500/5 flex justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-pink-600 scale-105'
                  : 'text-zinc-400'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] font-bold tracking-wide uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
