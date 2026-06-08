'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, LayoutDashboard, CalendarDays, BookOpen, Settings, LogOut, ChevronDown, MapPin, Award, Lock, Image } from 'lucide-react';
import { useApp } from '@/components/AppContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const primaryItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Timeline', href: '/timeline', icon: CalendarDays },
    { label: 'Journal', href: '/journal', icon: BookOpen },
  ];

  const moreItems = [
    { label: 'Love Map', href: '/love-map', icon: MapPin },
    { label: 'Bucket List', href: '/bucket-list', icon: Award },
    { label: 'Capsules', href: '/capsules', icon: Lock },
    { label: 'Gallery', href: '/gallery', icon: Image },
  ];

  const getInitials = (name1: string, name2: string | null) => {
    const n1 = name1.trim()[0] || '';
    const n2 = name2?.trim()[0] || '';
    return `${n1}${n2 ? '+' + n2 : ''}`.toUpperCase();
  };

  const isMoreActive = moreItems.some(item => pathname.startsWith(item.href));

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

          {/* Navigation Links */}
          <div className="flex items-center space-x-1.5 relative">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 ${
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

            {/* Scrapbook More Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all duration-300 cursor-pointer ${
                  isMoreActive
                    ? 'bg-rose-500/10 text-pink-650 border border-rose-200/50'
                    : 'text-zinc-650 hover:bg-rose-500/5 hover:text-pink-650'
                }`}
              >
                <span>Scrapbook</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-250 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-10 left-0 w-48 bg-white border border-rose-100 shadow-xl rounded-2xl py-2 px-1.5 z-50 animate-fade-in-up mt-1">
                  <div className="washi-tape-gold !w-[60px]" />
                  <div className="pt-2">
                    {moreItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center space-x-2.5 transition-colors ${
                            isActive
                              ? 'bg-rose-50 text-pink-650 font-black'
                              : 'text-zinc-650 hover:bg-rose-500/5 hover:text-pink-650'
                          }`}
                        >
                          <Icon className="h-4 w-4 text-pink-500" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Tab */}
            <Link
              href="/settings"
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 ${
                pathname.startsWith('/settings')
                  ? 'bg-linear-to-r from-pink-500 to-rose-450 text-white shadow-md shadow-pink-500/10'
                  : 'text-zinc-650 hover:bg-rose-500/5 hover:text-pink-650'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
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
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 ${
                isActive ? 'text-pink-600 scale-105' : 'text-zinc-400'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] font-bold tracking-wide uppercase">{item.label}</span>
            </Link>
          );
        })}

        {/* Mobile Drawer Trigger (More / Scrapbook folder) */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 cursor-pointer ${
            isMoreActive || pathname.startsWith('/settings') ? 'text-pink-600' : 'text-zinc-400'
          }`}
        >
          <ChevronDown className="h-5 w-5 mb-0.5 animate-bounce" />
          <span className="text-[10px] font-bold tracking-wide uppercase">More</span>
        </button>
      </nav>

      {/* Mobile Drawer Full Screen Overlay Menu */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/40 backdrop-blur-xs">
          <div 
            className="absolute inset-0" 
            onClick={() => setIsMobileDrawerOpen(false)} 
          />
          <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl space-y-5 border-t border-rose-100 max-h-[80vh] overflow-y-auto z-10 text-left">
            <div className="washi-tape-gold" />
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <h3 className="font-serif italic font-extrabold text-lg text-zinc-900">
                Explore Scrapbook
              </h3>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 transition-all ${
                      isActive
                        ? 'bg-rose-50 border-rose-200 text-pink-600 font-extrabold'
                        : 'bg-[#fdfaf8] border-rose-500/5 text-zinc-650'
                    }`}
                  >
                    <Icon className="h-6 w-6 text-pink-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                  </Link>
                );
              })}
              
              <Link
                href="/settings"
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 transition-all ${
                  pathname.startsWith('/settings')
                    ? 'bg-rose-50 border-rose-200 text-pink-600 font-extrabold'
                    : 'bg-[#fdfaf8] border-rose-500/5 text-zinc-650'
                }`}
              >
                <Settings className="h-6 w-6 text-pink-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
