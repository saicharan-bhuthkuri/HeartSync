'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Plus, Edit, Trash2, Calendar, Sparkles, BookOpen, AlertCircle, Heart, MessageSquare, Phone, Gift, Star, Award, MapPin } from 'lucide-react';

interface Milestone {
  id: string;
  user_id: string;
  title: string;
  event_type: string;
  event_date: string;
  description: string | null;
  photo_url: string | null;
}

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    eventType: 'first_date',
    eventDate: '',
    description: '',
    photoUrl: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMilestones = async () => {
    try {
      const res = await fetch('/api/milestones');
      if (!res.ok) throw new Error('Failed to load milestones');
      const json = await res.json();
      setMilestones(json.milestones);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      eventType: 'first_date',
      eventDate: '',
      description: '',
      photoUrl: '',
    });
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setFormData({
      title: milestone.title,
      eventType: milestone.event_type,
      eventDate: milestone.event_date,
      description: milestone.description || '',
      photoUrl: milestone.photo_url || '',
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const handleOpenDelete = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsDeleteOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create milestone');

      setMilestones(prev => [...prev, json.milestone].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save milestone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/milestones/${selectedMilestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update milestone');

      setMilestones(prev => prev.map(m => m.id === selectedMilestone.id ? { ...m, ...formData } as Milestone : m).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
      setIsEditOpen(false);
      setSelectedMilestone(null);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async () => {
    if (!selectedMilestone) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/milestones/${selectedMilestone.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete milestone');
      }

      setMilestones(prev => prev.filter(m => m.id !== selectedMilestone.id));
      setIsDeleteOpen(false);
      setSelectedMilestone(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete milestone');
    } finally {
      setIsSubmitting(false);
    }
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
      custom: '✨ Custom Milestone',
    };
    return types[type] || '✨ Milestone';
  };

  // Helper to map event types to custom visual markers (icons and gradient classes)
  const getEventTypeMarker = (type: string) => {
    const markers: Record<string, { icon: React.ReactNode; bgClass: string }> = {
      first_chat: {
        icon: <MessageSquare className="h-4 w-4 text-white" />,
        bgClass: 'bg-linear-to-tr from-sky-400 to-blue-500 shadow-sm shadow-sky-500/20',
      },
      first_call: {
        icon: <Phone className="h-4 w-4 text-white" />,
        bgClass: 'bg-linear-to-tr from-teal-400 to-emerald-500 shadow-sm shadow-teal-500/20',
      },
      first_meeting: {
        icon: <MapPin className="h-4 w-4 text-white" />,
        bgClass: 'bg-linear-to-tr from-orange-400 to-amber-500 shadow-sm shadow-orange-500/20',
      },
      first_date: {
        icon: <Heart className="h-4 w-4 text-white fill-current animate-pulse" />,
        bgClass: 'bg-linear-to-tr from-pink-500 to-rose-450 shadow-sm shadow-rose-500/20',
      },
      proposal: {
        icon: <Award className="h-4 w-4 text-white" />,
        bgClass: 'bg-linear-to-tr from-amber-400 to-yellow-600 shadow-sm shadow-amber-500/20',
      },
      anniversary: {
        icon: <Sparkles className="h-4 w-4 text-white" />,
        bgClass: 'bg-linear-to-tr from-pink-500 to-purple-600 shadow-sm shadow-purple-500/20',
      },
      birthday: {
        icon: <Gift className="h-4 w-4 text-white" />,
        bgClass: 'bg-linear-to-tr from-purple-400 to-indigo-500 shadow-sm shadow-indigo-500/20',
      },
      custom: {
        icon: <Star className="h-4 w-4 text-white" />,
        bgClass: 'bg-linear-to-tr from-zinc-400 to-zinc-650 shadow-sm shadow-zinc-500/20',
      },
    };
    return markers[type] || {
      icon: <Star className="h-4 w-4 text-white" />,
      bgClass: 'bg-linear-to-tr from-rose-400 to-pink-400',
    };
  };

  const eventTypeOptions = [
    { value: 'first_chat', label: 'First Chat 💬' },
    { value: 'first_call', label: 'First Call 📞' },
    { value: 'first_meeting', label: 'First Meeting 🤝' },
    { value: 'first_date', label: 'First Date 🌹' },
    { value: 'proposal', label: 'Proposal Day 💍' },
    { value: 'anniversary', label: 'Anniversary 💖' },
    { value: 'birthday', label: 'Birthday 🎂' },
    { value: 'custom', label: 'Custom Event ✨' },
  ];

  const formatFriendlyDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif italic font-extrabold text-[#3a1e22] flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-rose-500" /> Our Timeline
          </h2>
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            A chronological memory lane of our love story
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto shadow-md shadow-pink-500/10 border-0 bg-linear-to-r from-pink-500 to-rose-450 hover:from-pink-600 hover:to-rose-550 text-white font-extrabold uppercase tracking-wide text-xs">
          <Plus className="h-4 w-4 mr-2" /> Add Milestone
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse pl-8 border-l-2 border-zinc-100">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-zinc-100 rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/5 rounded-3xl border border-red-500/10 max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-zinc-800 font-bold">{error}</p>
          <Button onClick={fetchMilestones} className="mt-4" variant="secondary">Retry</Button>
        </div>
      ) : milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-rose-200 rounded-[32px] max-w-lg mx-auto bg-white/40">
          <span className="text-4xl mb-4">✨</span>
          <h3 className="text-lg font-serif italic font-bold text-zinc-850">Your timeline is empty</h3>
          <p className="text-zinc-550 text-xs mt-1.5 max-w-md leading-relaxed font-medium">
            Start cataloging your story. Add your first chat, your first date, or any special memory that brings a smile.
          </p>
          <Button onClick={handleOpenCreate} className="mt-6">
            <Plus className="h-4 w-4 mr-2" /> Create A Milestone
          </Button>
        </div>
      ) : (
        /* VISUAL VERTICAL TIMELINE CONTAINER */
        <div className="relative pl-7 md:pl-10 ml-5 md:ml-6 py-4 space-y-8 text-left">
          
          {/* Glowing Vertical Timeline Track Styled like a Ribbon/Stitched line */}
          <div className="absolute left-0 top-0 bottom-0 w-0 border-l-2 border-dashed border-rose-350" />

          {milestones.map((milestone) => {
            const marker = getEventTypeMarker(milestone.event_type);
            return (
              <div key={milestone.id} className="relative">
                
                {/* Custom Event Icon Timeline Marker Point */}
                <div className={`absolute left-[-39px] md:left-[-49px] top-3.5 flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-full ${marker.bgClass} border-4 border-white shadow-md transition-transform hover:scale-110 z-10`}>
                  {marker.icon}
                </div>

                {/* Milestone Card content (Polaroid-frame styled if has photo, else scrapbook washi-taped card) */}
                <Card variant="glass" className="hover:border-rose-450/25 transition-all p-6 bg-white/80 relative overflow-hidden">
                  <div className="washi-tape-gold" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pt-2">
                    <div>
                      {/* Badge event type */}
                      <span className="inline-block text-[9px] font-bold uppercase tracking-widest bg-rose-50 text-rose-700 px-3 py-1 rounded-full mb-2.5 border border-rose-100/50">
                        {getEventTypeLabel(milestone.event_type)}
                      </span>
                      <h3 className="text-xl font-serif italic font-extrabold text-zinc-900 leading-tight">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-zinc-400 flex items-center mt-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 mr-1" /> {formatFriendlyDate(milestone.event_date)}
                      </p>
                    </div>

                    {/* Actions Header */}
                    <div className="flex items-center space-x-1 sm:self-start mt-2 sm:mt-0">
                      <Link href={`/journal?milestoneId=${milestone.id}`} title="Add Journal Note">
                        <Button variant="ghost" size="sm" className="p-2 h-9 w-9 text-zinc-400 hover:text-pink-650 hover:bg-rose-500/5 rounded-full">
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(milestone)}
                        className="p-2 h-9 w-9 text-zinc-400 hover:text-amber-600 hover:bg-amber-500/5 rounded-full"
                        title="Edit Milestone"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(milestone)}
                        className="p-2 h-9 w-9 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-full"
                        title="Delete Milestone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {milestone.description && (
                    <p className="text-sm text-zinc-650 mt-4 whitespace-pre-line leading-relaxed font-medium border-l-2 border-rose-100 pl-3.5">
                      {milestone.description}
                    </p>
                  )}

                  {milestone.photo_url && (
                    <div className="mt-5 p-3 pb-8 bg-white border border-rose-500/5 shadow-md rounded-[4px] max-w-xl mx-auto rotate-[0.5deg]">
                      <div className="rounded-xs overflow-hidden max-h-96 w-full border border-zinc-100">
                        <img
                          src={milestone.photo_url}
                          alt={milestone.title}
                          className="object-cover w-full h-full hover:scale-[1.01] transition-transform duration-500"
                        />
                      </div>
                      <div className="mt-3 text-center text-[10px] text-zinc-400 font-serif italic">
                        ❤ Captured on {formatFriendlyDate(milestone.event_date)}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL DIALOG */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Milestone">
        <form onSubmit={handleCreateMilestone} className="space-y-4 text-left">
          {formError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl">{formError}</div>}
          
          <Input
            label="Milestone Title"
            name="title"
            required
            value={formData.title}
            onChange={handleFormChange}
            placeholder="e.g. Our First Date"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Event Type"
              name="eventType"
              options={eventTypeOptions}
              value={formData.eventType}
              onChange={handleFormChange}
            />
            <Input
              label="Event Date"
              name="eventDate"
              type="date"
              required
              value={formData.eventDate}
              onChange={handleFormChange}
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Tell the story of this special moment..."
          />

          <Input
            label="Optional Photo URL"
            name="photoUrl"
            type="url"
            value={formData.photoUrl}
            onChange={handleFormChange}
            placeholder="e.g. https://images.unsplash.com/... or a public link"
          />

          <div className="pt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="border-0 bg-linear-to-r from-pink-500 to-rose-450 text-white">
              Save Milestone
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT MODAL DIALOG */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Milestone">
        <form onSubmit={handleEditMilestone} className="space-y-4 text-left">
          {formError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl">{formError}</div>}

          <Input
            label="Milestone Title"
            name="title"
            required
            value={formData.title}
            onChange={handleFormChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Event Type"
              name="eventType"
              options={eventTypeOptions}
              value={formData.eventType}
              onChange={handleFormChange}
            />
            <Input
              label="Event Date"
              name="eventDate"
              type="date"
              required
              value={formData.eventDate}
              onChange={handleFormChange}
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
          />

          <Input
            label="Photo URL"
            name="photoUrl"
            type="url"
            value={formData.photoUrl}
            onChange={handleFormChange}
            placeholder="e.g. URL starting with https://"
          />

          <div className="pt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="border-0 bg-linear-to-r from-pink-500 to-rose-450 text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DELETE MODAL DIALOG */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Milestone">
        <div className="space-y-4 text-left">
          <p className="text-zinc-650 text-sm">
            Are you sure you want to delete the milestone <strong className="text-zinc-800">"{selectedMilestone?.title}"</strong>?
          </p>
          <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-xs text-red-650 flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
            <span>This action is permanent and will also delete any memories linked directly to this milestone.</span>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteMilestone} isLoading={isSubmitting}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
