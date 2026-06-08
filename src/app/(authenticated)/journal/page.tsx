'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Search, BookOpen, Plus, Calendar, Edit, Trash2, Link as LinkIcon, Sparkles } from 'lucide-react';
import { MediaUpload } from '@/components/ui/MediaUpload';

interface Memory {
  id: string;
  user_id: string;
  milestone_id: string | null;
  title: string;
  notes: string;
  image_url: string | null;
  memory_date: string;
  milestone_title: string | null;
}

interface MilestoneOption {
  id: string;
  title: string;
}

function JournalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [milestones, setMilestones] = useState<MilestoneOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMilestoneFilter, setSelectedMilestoneFilter] = useState('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    imageUrl: '',
    memoryDate: new Date().toISOString().split('T')[0],
    milestoneId: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load memories and user's milestones for linking
  const loadData = async () => {
    try {
      // Fetch milestones first to populate dropdowns
      const milestonesRes = await fetch('/api/milestones');
      if (milestonesRes.ok) {
        const milestonesJson = await milestonesRes.json();
        setMilestones(milestonesJson.milestones.map((m: any) => ({ id: m.id, title: m.title })));
      }

      // Fetch memories
      await fetchMemories();
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemories = async (query = '', milestoneId = '') => {
    try {
      let url = '/api/memories';
      const params: string[] = [];
      if (query) params.push(`q=${encodeURIComponent(query)}`);
      if (milestoneId && milestoneId !== 'all') params.push(`milestoneId=${milestoneId}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setMemories(json.memories);
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    }
  };

  // Run on mount
  useEffect(() => {
    loadData();
  }, []);

  // Pre-fill milestone from URL if available
  useEffect(() => {
    const urlMilestoneId = searchParams.get('milestoneId');
    if (urlMilestoneId) {
      setFormData(prev => ({
        ...prev,
        milestoneId: urlMilestoneId,
        memoryDate: new Date().toISOString().split('T')[0],
      }));
      setIsCreateOpen(true);
      
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('milestoneId');
      router.replace(`/journal?${newParams.toString()}`);
    }
  }, [searchParams]);

  // Handle search & filters
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchMemories(val, selectedMilestoneFilter);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMilestoneFilter(val);
    fetchMemories(searchQuery, val);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      notes: '',
      imageUrl: '',
      memoryDate: new Date().toISOString().split('T')[0],
      milestoneId: '',
    });
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (memory: Memory) => {
    setSelectedMemory(memory);
    setFormData({
      title: memory.title,
      notes: memory.notes,
      imageUrl: memory.image_url || '',
      memoryDate: memory.memory_date,
      milestoneId: memory.milestone_id || '',
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const handleOpenDelete = (memory: Memory) => {
    setSelectedMemory(memory);
    setIsDeleteOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create memory entry');

      fetchMemories(searchQuery, selectedMilestoneFilter);
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemory) return;
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/memories/${selectedMemory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update memory');

      fetchMemories(searchQuery, selectedMilestoneFilter);
      setIsEditOpen(false);
      setSelectedMemory(null);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (!selectedMemory) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/memories/${selectedMemory.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete memory');
      }

      setMemories(prev => prev.filter(m => m.id !== selectedMemory.id));
      setIsDeleteOpen(false);
      setSelectedMemory(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filterOptions = [
    { value: 'all', label: 'All Milestones' },
    ...milestones.map((m) => ({ value: m.id, label: m.title })),
  ];

  const modalMilestoneOptions = [
    { value: '', label: 'Do not link to a milestone' },
    ...milestones.map((m) => ({ value: m.id, label: m.title })),
  ];

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif italic font-extrabold text-[#3a1e22] flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-rose-500" /> Memory Journal
          </h2>
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            Preserve your daily shared details, letters, and snapshots
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto shadow-md shadow-pink-500/10 border-0 bg-linear-to-r from-pink-500 to-rose-450 hover:from-pink-600 hover:to-rose-550 text-white font-extrabold uppercase tracking-wide text-xs">
          <Plus className="h-4 w-4 mr-2" /> Write Memory
        </Button>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-white/60 p-4 rounded-3xl border border-rose-500/5 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search memories by words..."
            className="pl-11"
            containerClassName="w-full"
          />
        </div>
        <div>
          <Select
            options={filterOptions}
            value={selectedMilestoneFilter}
            onChange={handleFilterChange}
            containerClassName="w-full"
          />
        </div>
      </div>

      {/* Memories Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 4].map(i => (
            <div key={i} className="h-48 bg-zinc-100 rounded-3xl" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-rose-200 rounded-[32px] max-w-lg mx-auto bg-white/40">
          <span className="text-4xl mb-4">📓</span>
          <h3 className="text-lg font-serif italic font-bold text-zinc-800">No journal notes found</h3>
          <p className="text-zinc-550 text-xs mt-1.5 max-w-md leading-relaxed font-medium">
            {searchQuery || selectedMilestoneFilter !== 'all'
              ? 'Try adjusting your search filters.'
              : 'Write down a letter, add a photos, or save some special words to look back on.'}
          </p>
          {!searchQuery && selectedMilestoneFilter === 'all' && (
            <Button onClick={handleOpenCreate} className="mt-6">
              Write First Memory
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memories.map((memory) => (
            <Card key={memory.id} variant="glass" className="flex flex-col justify-between hover:border-rose-400/25 transition-all p-5 bg-white/85 relative overflow-hidden">
              <div className="washi-tape" />
              <div className="space-y-4 pt-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-serif italic font-extrabold text-zinc-900 leading-snug">
                      {memory.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 flex items-center mt-1 font-semibold">
                      <Calendar className="h-3.5 w-3.5 mr-1" /> {formatFriendlyDate(memory.memory_date)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(memory)}
                      className="p-1.5 h-8 w-8 text-zinc-400 hover:text-amber-600 rounded-full"
                      title="Edit Note"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDelete(memory)}
                      className="p-1.5 h-8 w-8 text-zinc-400 hover:text-red-500 rounded-full"
                      title="Delete Note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Milestone Badge connection */}
                {memory.milestone_title && (
                  <div className="inline-block">
                    <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-sm border border-rose-100">
                      <LinkIcon className="h-2.5 w-2.5 mr-1 text-pink-500" /> Linked: {memory.milestone_title}
                    </span>
                  </div>
                )}

                {/* Lined Notebook Page notes container */}
                <div className="p-4 rounded-2xl bg-[#faf7f5] border border-rose-500/5 shadow-inner">
                  <p className="text-sm text-zinc-650 leading-relaxed whitespace-pre-line font-medium lined-paper">
                    {memory.notes}
                  </p>
                </div>

                {memory.image_url && (
                  <div className="p-3 pb-8 bg-white border border-rose-500/5 shadow-md rounded-[4px] -rotate-1 max-w-md mx-auto">
                    <div className="rounded-xs overflow-hidden max-h-60 w-full border border-zinc-100">
                      {(() => {
                        const lower = memory.image_url.toLowerCase();
                        const isVid = ['.mp4', '.webm', '.ogg', '.mov'].some(ext => lower.endsWith(ext)) || lower.includes('video') || lower.includes('/uploads/video');
                        if (isVid) {
                          return (
                            <video
                              src={memory.image_url}
                              className="w-full h-full object-cover max-h-60"
                              controls
                            />
                          );
                        }
                        return (
                          <img
                            src={memory.image_url}
                            alt={memory.title}
                            className="object-cover w-full h-full"
                          />
                        );
                      })()}
                    </div>
                    <div className="mt-3 text-center text-[9px] text-zinc-400 font-serif italic">
                      Captured details
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* WRITE MEMORY MODAL */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Write A New Memory">
        <form onSubmit={handleCreateMemory} className="space-y-4">
          {formError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl">{formError}</div>}

          <Input
            label="Memory Title"
            name="title"
            required
            value={formData.title}
            onChange={handleFormChange}
            placeholder="Give this memory a title..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Memory Date"
              name="memoryDate"
              type="date"
              required
              value={formData.memoryDate}
              onChange={handleFormChange}
            />
            <Select
              label="Link To Milestone"
              name="milestoneId"
              options={modalMilestoneOptions}
              value={formData.milestoneId}
              onChange={handleFormChange}
            />
          </div>

          <Textarea
            label="Journal Notes"
            name="notes"
            required
            value={formData.notes}
            onChange={handleFormChange}
            placeholder="Write down what happened, how it felt, or letters to each other..."
          />

          <MediaUpload
            label="Optional Photo / Video"
            value={formData.imageUrl}
            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
            placeholder="e.g. Photo link starting with https:// or upload a file"
          />

          <div className="pt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="border-0 bg-linear-to-r from-pink-500 to-rose-450 text-white">
              Save Memory
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT MEMORY MODAL */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Memory Entry">
        <form onSubmit={handleEditMemory} className="space-y-4">
          {formError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl">{formError}</div>}

          <Input
            label="Memory Title"
            name="title"
            required
            value={formData.title}
            onChange={handleFormChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Memory Date"
              name="memoryDate"
              type="date"
              required
              value={formData.memoryDate}
              onChange={handleFormChange}
            />
            <Select
              label="Link To Milestone"
              name="milestoneId"
              options={modalMilestoneOptions}
              value={formData.milestoneId}
              onChange={handleFormChange}
            />
          </div>

          <Textarea
            label="Journal Notes"
            name="notes"
            required
            value={formData.notes}
            onChange={handleFormChange}
          />

          <MediaUpload
            label="Photo / Video"
            value={formData.imageUrl}
            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
            placeholder="e.g. https:// or upload a file"
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

      {/* DELETE MEMORY MODAL */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Memory Note">
        <div className="space-y-4">
          <p className="text-zinc-650 text-sm">
            Are you sure you want to delete the memory entry <strong className="text-zinc-800">"{selectedMemory?.title}"</strong>?
          </p>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteMemory} isLoading={isSubmitting}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default function JournalPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <p className="text-rose-500 font-semibold animate-pulse">Loading Journal...</p>
      </div>
    }>
      <JournalContent />
    </Suspense>
  );
}
