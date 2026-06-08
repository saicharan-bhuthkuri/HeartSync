'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  partnerName1: string;
  partnerName2: string | null;
  relationshipStartDate: string; // YYYY-MM-DD
  themePreference: 'light' | 'dark' | 'system';
  avatarUrl1?: string | null;
  avatarUrl2?: string | null;
  playlistUrl?: string | null;
}

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  theme: 'light';
  setTheme: (theme: 'light') => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user session on mount
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUserState(data.user);
        } else {
          setUserState(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Force light mode in DOM always
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  const setTheme = () => {
    // Theme is strictly locked to light mode.
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUserState(null);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        theme: 'light',
        setTheme,
        setUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
