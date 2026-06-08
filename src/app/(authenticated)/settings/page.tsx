'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Settings, Save, AlertCircle, CheckCircle, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser } = useApp();

  const [formData, setFormData] = useState({
    partnerName1: '',
    partnerName2: '',
    relationshipStartDate: '',
    avatarUrl1: '',
    avatarUrl2: '',
  });

  // Reminder settings state
  const [notificationEmail, setNotificationEmail] = useState('');
  const [reminderPref, setReminderPref] = useState({
    thirtyDaysBefore: true,
    sevenDaysBefore: true,
    oneDayBefore: true,
    onEventDay: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        partnerName1: user.partnerName1 || '',
        partnerName2: user.partnerName2 || '',
        relationshipStartDate: user.relationshipStartDate || '',
        avatarUrl1: user.avatarUrl1 || '',
        avatarUrl2: user.avatarUrl2 || '',
      });
      setNotificationEmail(user.email || '');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      // 1. Save Profile Details
      const profileRes = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName1: formData.partnerName1,
          partnerName2: formData.partnerName2 || null,
          relationshipStartDate: formData.relationshipStartDate,
          avatarUrl1: formData.avatarUrl1 || null,
          avatarUrl2: formData.avatarUrl2 || null,
        }),
      });

      if (!profileRes.ok) {
        const json = await profileRes.json();
        throw new Error(json.error || 'Failed to update profile settings');
      }

      // 2. Mock save reminders configuration
      // In a production app, this would hit an API storing these defaults in the database.
      // We will simulate saving successfully.

      // Update local state
      if (user) {
        setUser({
          ...user,
          partnerName1: formData.partnerName1,
          partnerName2: formData.partnerName2 || null,
          relationshipStartDate: formData.relationshipStartDate,
          avatarUrl1: formData.avatarUrl1 || null,
          avatarUrl2: formData.avatarUrl2 || null,
        });
      }

      setStatus({ type: 'success', message: 'Settings saved successfully' });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center">
          <Settings className="h-6 w-6 mr-2 text-rose-500" /> Space Settings
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Customize your relationship timeline, notification preferences, and styling themes
        </p>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl flex items-start space-x-2 border animate-fade-in-up ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-semibold">{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PROFILE SECTION */}
        <div className="md:col-span-2 space-y-6">
          <Card variant="glass" className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center mb-2">
              <User className="h-4.5 w-4.5 mr-1.5 text-rose-500" /> Relationship Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Name (Partner 1)"
                name="partnerName1"
                required
                value={formData.partnerName1}
                onChange={handleInputChange}
                placeholder="Partner 1"
              />
              <Input
                label="Partner's Name (Partner 2)"
                name="partnerName2"
                value={formData.partnerName2}
                onChange={handleInputChange}
                placeholder="Partner 2"
              />
            </div>

            <Input
              label="Anniversary / Relationship Start Date"
              name="relationshipStartDate"
              type="date"
              required
              value={formData.relationshipStartDate}
              onChange={handleInputChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Avatar URL (Partner 1)"
                name="avatarUrl1"
                value={formData.avatarUrl1}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/... or a public URL"
              />
              <Input
                label="Avatar URL (Partner 2)"
                name="avatarUrl2"
                value={formData.avatarUrl2}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/... or a public URL"
              />
            </div>
          </Card>

          {/* NOTIFICATION PREFERENCES */}
          <Card variant="glass" className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center mb-2">
              <Bell className="h-4.5 w-4.5 mr-1.5 text-rose-500" /> Reminder Configurations
            </h3>

            <Input
              label="Primary Notification Email"
              name="notificationEmail"
              type="email"
              disabled
              value={notificationEmail}
              className="opacity-70 bg-zinc-100 dark:bg-zinc-900 cursor-not-allowed"
              placeholder="Primary email"
            />

            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400 pl-1">
                Default Milestone Reminders
              </span>
              
              <div className="space-y-2.5">
                {[
                  { key: 'thirtyDaysBefore', label: '30 Days before milestone' },
                  { key: 'sevenDaysBefore', label: '7 Days before milestone' },
                  { key: 'oneDayBefore', label: '1 Day before milestone' },
                  { key: 'onEventDay', label: 'On the milestone day itself' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center space-x-3 text-sm font-medium text-zinc-700 dark:text-zinc-350 cursor-pointer pl-1"
                  >
                    <input
                      type="checkbox"
                      checked={(reminderPref as any)[item.key]}
                      onChange={(e) =>
                        setReminderPref({
                          ...reminderPref,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="rounded text-rose-600 focus:ring-rose-400 h-4.5 w-4.5 border-zinc-300 bg-white dark:bg-zinc-900"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* SAVE BUTTON CONTAINER */}
        <div className="space-y-6">
          <Button
            type="submit"
            className="w-full flex items-center justify-center py-3 rounded-2xl"
            isLoading={isLoading}
          >
            <Save className="h-4 w-4 mr-2" /> Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
