'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Textarea } from '@/components/ui/Input';
import { Lock, Unlock, Mail, Calendar, User, Plus, Clock, Sparkles, AlertCircle } from 'lucide-react';

interface Capsule {
  id: string;
  user_id: string;
  sender_name: string;
  title: string;
  unlock_date: string;
  created_at: string;
  isLocked: boolean;
  content: string | null;
}

export default function TimeCapsulesPage() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    senderName: '',
    unlockDate: '',
    content: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCapsules = async () => {
    try {
      const res = await fetch('/api/capsules');
      if (!res.ok) throw new Error('Failed to load time capsules');
      const json = await res.json();
      setCapsules(json.capsules);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, []);

  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/capsules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to seal capsule');

      setCapsules(prev => [...prev, json.capsule].sort((a, b) => new Date(a.unlock_date).getTime() - new Date(b.unlock_date).getTime()));
      setIsCreateOpen(false);
      setFormData({ title: '', senderName: '', unlockDate: '', content: '' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save capsule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRemainingDays = (unlockDateStr: string) => {
    const diff = new Date(unlockDateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatFriendlyDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto pb-10 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif italic font-extrabold text-[#3a1e22] flex items-center">
            <Lock className="h-6 w-6 mr-2 text-rose-500" /> Love Time Capsules
          </h2>
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            Seal private love letters to each other that can only be unlocked on a specific future date
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto shadow-md shadow-pink-500/10 border-0 bg-linear-to-r from-pink-500 to-rose-450 hover:from-pink-600 hover:to-rose-550 text-white font-extrabold uppercase tracking-wide text-xs">
          <Plus className="h-4 w-4 mr-2" /> Write Capsule Letter
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl flex items-center max-w-md">
          <AlertCircle className="h-4 w-4 mr-2" /> {error}
        </div>
      )}

      {/* Capsules Envelopes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-44 bg-zinc-100 rounded-3xl" />
          ))}
        </div>
      ) : capsules.length === 0 ? (
        <Card variant="glass" className="p-12 text-center border-rose-500/5 bg-white/45 max-w-lg mx-auto relative overflow-hidden">
          <div className="washi-tape" />
          <Mail className="h-10 w-10 text-rose-300 mb-3 mx-auto animate-pulse" />
          <p className="text-sm font-serif italic font-bold text-zinc-700">No sealed letters yet</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-[200px] mx-auto font-medium">
            Write a future anniversary note or romantic promise and seal it with a locked capsule.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {capsules.map(capsule => {
            const daysLeft = getRemainingDays(capsule.unlock_date);
            return (
              <Card
                key={capsule.id}
                variant="glass"
                onClick={() => {
                  if (!capsule.isLocked) {
                    setSelectedCapsule(capsule);
                  } else {
                    alert(`🔒 Locked! This envelope can only be opened on ${formatFriendlyDate(capsule.unlock_date)} (${daysLeft} days remaining).`);
                  }
                }}
                className={`hover:border-rose-450/20 transition-all p-5 relative overflow-hidden flex flex-col justify-between h-48 cursor-pointer ${
                  capsule.isLocked
                    ? 'bg-zinc-50/70 border-zinc-200/50'
                    : 'bg-white/95 shadow-md shadow-pink-500/5 hover:scale-102 duration-300'
                }`}
              >
                <div className="washi-tape" />
                <div className="pt-2">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-2xl bg-rose-500/5 text-pink-500">
                      {capsule.isLocked ? (
                        <Lock className="h-5 w-5 text-zinc-400" />
                      ) : (
                        <Unlock className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                    {capsule.isLocked && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-sm border border-zinc-200/50">
                        {daysLeft}d left
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif italic font-bold text-base text-zinc-900 mt-3.5 leading-snug line-clamp-1">
                    {capsule.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-semibold flex items-center mt-1">
                    <User className="h-3 w-3 mr-1" /> From: {capsule.sender_name}
                  </p>
                </div>

                <div className="border-t border-rose-500/5 pt-2.5 flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
                  <span className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-rose-400" /> Unlocks: {new Date(capsule.unlock_date).toLocaleDateString()}
                  </span>
                  {!capsule.isLocked && (
                    <span className="text-pink-600 font-extrabold uppercase tracking-wider text-[9px] flex items-center">
                      <Sparkles className="h-3 w-3 mr-0.5 text-pink-500 animate-pulse" /> Open Letter
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* WRITE TIME CAPSULE LETTER MODAL */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Seal A Time Capsule">
        <form onSubmit={handleCreateCapsule} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Name (Sender)"
              name="senderName"
              required
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              placeholder="Your name"
            />
            <Input
              label="Unlock Date"
              name="unlockDate"
              type="date"
              required
              value={formData.unlockDate}
              onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
            />
          </div>

          <Input
            label="Letter Title / Theme"
            name="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Read this on our 5th anniversary, Happy birthday promise"
          />

          <Textarea
            label="Your Locked Letter"
            name="content"
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your secret words here... They cannot be edited or viewed by anyone until the unlock date!"
            className="min-h-[150px]"
          />

          <div className="pt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="border-0 bg-linear-to-r from-pink-500 to-rose-450 text-white font-extrabold">
              Seal & Lock Envelope 🔒
            </Button>
          </div>
        </form>
      </Dialog>

      {/* VIEW LETTER DIALOG */}
      <Dialog
        isOpen={selectedCapsule !== null}
        onClose={() => setSelectedCapsule(null)}
        title="Opened Time Capsule Letter"
        size="lg"
      >
        {selectedCapsule && (
          <div className="space-y-5 pt-3">
            <div className="washi-tape-gold" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-zinc-400 font-semibold border-b border-rose-100 pb-3 gap-2">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1 text-rose-500" /> Written by: <strong className="text-zinc-700 ml-1">{selectedCapsule.sender_name}</strong>
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-rose-500" /> Sealed: {formatFriendlyDate(selectedCapsule.created_at)}
              </span>
            </div>

            <h3 className="font-serif italic font-extrabold text-2xl text-zinc-900 text-center leading-snug">
              {selectedCapsule.title}
            </h3>

            {/* Parchment diary text styled letter container */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#faf7f5] border border-rose-500/5 shadow-inner">
              <p className="text-sm font-serif italic text-zinc-750 leading-loose whitespace-pre-line lined-paper text-justify">
                {selectedCapsule.content}
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Button onClick={() => setSelectedCapsule(null)} className="shadow-md shadow-pink-500/10 border-0 bg-linear-to-r from-pink-500 to-rose-450 text-white font-extrabold">
                Close Letter
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
