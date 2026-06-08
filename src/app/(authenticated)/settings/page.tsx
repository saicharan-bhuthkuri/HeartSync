'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Settings, Save, AlertCircle, CheckCircle, Bell, User, Music, Trash2 } from 'lucide-react';
import { MediaUpload } from '@/components/ui/MediaUpload';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, setUser } = useApp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    email2: '',
    partnerName1: '',
    partnerName2: '',
    relationshipStartDate: '',
    avatarUrl1: '',
    avatarUrl2: '',
    playlistUrl: '',
  });

  // Reminder settings state
  const [reminderPref, setReminderPref] = useState({
    thirtyDaysBefore: true,
    sevenDaysBefore: true,
    oneDayBefore: true,
    onEventDay: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Deletion state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        email2: user.email2 || '',
        partnerName1: user.partnerName1 || '',
        partnerName2: user.partnerName2 || '',
        relationshipStartDate: user.relationshipStartDate || '',
        avatarUrl1: user.avatarUrl1 || '',
        avatarUrl2: user.avatarUrl2 || '',
        playlistUrl: user.playlistUrl || '',
      });
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
          email: formData.email,
          email2: formData.email2 || null,
          partnerName1: formData.partnerName1,
          partnerName2: formData.partnerName2 || null,
          relationshipStartDate: formData.relationshipStartDate,
          avatarUrl1: formData.avatarUrl1 || null,
          avatarUrl2: formData.avatarUrl2 || null,
          playlistUrl: formData.playlistUrl || null,
        }),
      });

      if (!profileRes.ok) {
        const json = await profileRes.json();
        throw new Error(json.error || 'Failed to update profile settings');
      }

      // Update local state
      if (user) {
        setUser({
          ...user,
          email: formData.email,
          email2: formData.email2 || null,
          partnerName1: formData.partnerName1,
          partnerName2: formData.partnerName2 || null,
          relationshipStartDate: formData.relationshipStartDate,
          avatarUrl1: formData.avatarUrl1 || null,
          avatarUrl2: formData.avatarUrl2 || null,
          playlistUrl: formData.playlistUrl || null,
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete my space') return;
    setIsDeleting(true);

    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete space');
      }

      setUser(null);
      setIsDeleteOpen(false);
      router.push('/login');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Could not delete your space');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto text-left">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-serif italic font-extrabold text-[#3a1e22] flex items-center">
          <Settings className="h-6 w-6 mr-2 text-rose-500" /> Space Settings
        </h2>
        <p className="text-zinc-500 text-sm mt-1 font-medium">
          Customize your relationship timeline, notification preferences, and styling details
        </p>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl flex items-start space-x-2 border animate-fade-in-up ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
            : 'bg-red-500/10 border-red-500/20 text-red-600'
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
          <Card variant="glass" className="space-y-4 bg-white/80 relative overflow-hidden pt-6">
            <div className="washi-tape-gold" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center mb-2 pt-2">
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
              <MediaUpload
                label="Avatar (Partner 1)"
                value={formData.avatarUrl1}
                onChange={(url) => setFormData(prev => ({ ...prev, avatarUrl1: url }))}
                placeholder="Avatar link or upload"
              />
              <MediaUpload
                label="Avatar (Partner 2)"
                value={formData.avatarUrl2}
                onChange={(url) => setFormData(prev => ({ ...prev, avatarUrl2: url }))}
                placeholder="Avatar link or upload"
              />
            </div>
          </Card>

          {/* NOTIFICATION PREFERENCES */}
          <Card variant="glass" className="space-y-4 bg-white/80 relative overflow-hidden pt-6">
            <div className="washi-tape" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center mb-2 pt-2">
              <Bell className="h-4.5 w-4.5 mr-1.5 text-rose-500" /> Reminder Configurations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address (Partner 1)"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="partner1@example.com"
              />
              <Input
                label="Email Address (Partner 2)"
                name="email2"
                type="email"
                required
                value={formData.email2}
                onChange={handleInputChange}
                placeholder="partner2@example.com"
              />
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-black tracking-wide uppercase text-zinc-400 pl-1">
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
                    className="flex items-center space-x-3 text-sm font-semibold text-zinc-700 cursor-pointer pl-1"
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
                      className="rounded text-pink-500 focus:ring-pink-400 h-4.5 w-4.5 border-rose-200 bg-white"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* SHARED PLAYLIST INTEGRATION */}
          <Card variant="glass" className="space-y-4 bg-white/80 relative overflow-hidden pt-6">
            <div className="washi-tape-gold" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center mb-2 pt-2">
              <Music className="h-4.5 w-4.5 mr-1.5 text-rose-500" /> Our Soundtrack Playlist
            </h3>

            <Input
              label="Shared Spotify / YouTube Embed URL"
              name="playlistUrl"
              value={formData.playlistUrl}
              onChange={handleInputChange}
              placeholder="e.g. https://open.spotify.com/embed/playlist/... or YouTube embed URL"
            />

            <div className="text-xs text-zinc-400 font-medium pl-1 leading-relaxed">
              💡 <strong>How to get this link:</strong> Go to Spotify, click <strong>Share</strong> → <strong>Embed playlist/track</strong>, copy the link inside the <code>src="..."</code> attribute, and paste it here.
            </div>

            {formData.playlistUrl && (
              <div className="mt-4 pt-2 border-t border-rose-100">
                <span className="text-[10px] font-black tracking-wide uppercase text-zinc-400 block mb-2 pl-1">
                  Preview Widget
                </span>
                <div className="rounded-2xl overflow-hidden shadow-xs border border-rose-100 bg-[#fdfaf8] h-[80px]">
                  <iframe
                    src={formData.playlistUrl}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allowFullScreen={false}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* SAVE & DELETE SIDEBAR */}
        <div className="space-y-6 flex flex-col">
          <Button
            type="submit"
            className="w-full flex items-center justify-center py-3 rounded-2xl shadow-md shadow-pink-500/10 border-0 bg-linear-to-r from-pink-500 to-rose-450 hover:from-pink-600 hover:to-rose-550 text-white font-extrabold uppercase tracking-wider text-xs"
            isLoading={isLoading}
          >
            <Save className="h-4 w-4 mr-2" /> Save All Settings
          </Button>

          {/* DANGER ZONE */}
          <Card className="border-red-200 bg-red-50/20 p-5 space-y-4 rounded-3xl mt-2 text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-red-500" /> Danger Zone
            </h3>
            <p className="text-[11px] text-zinc-550 leading-relaxed font-semibold">
              Deleting your account permanently wipes out your couple's space. All milestones, memories, journal entries, bucket lists, love map pins, and sealed capsules will be lost forever.
            </p>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setDeleteConfirmText('');
                setIsDeleteOpen(true);
              }}
              className="w-full flex items-center justify-center py-2.5 rounded-2xl shadow-sm text-xs font-extrabold uppercase tracking-wide"
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete Space & Account
            </Button>
          </Card>
        </div>
      </form>

      {/* CONFIRMATION DIALOG MODAL */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Couples Space permanently?"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-zinc-650 font-medium">
            This action is permanent and irreversible. All milestones, photos, memories, maps, bucket lists, and locked capsule letters will be immediately and completely deleted.
          </p>

          <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/10 text-xs text-red-650 flex items-start">
            <AlertCircle className="h-4.5 w-4.5 mr-2 shrink-0 mt-0.5 text-red-500" />
            <span>To confirm, please type <strong className="underline text-red-700">delete my space</strong> in the box below.</span>
          </div>

          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type 'delete my space' to confirm..."
            containerClassName="w-full"
          />

          <div className="pt-2 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleteConfirmText.toLowerCase() !== 'delete my space'}
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Yes, Delete My Space
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
