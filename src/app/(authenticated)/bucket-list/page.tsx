'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select } from '@/components/ui/Input';
import { CheckSquare, Square, Plus, Trash2, Calendar, Award, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface BucketItem {
  id: string;
  user_id: string;
  title: string;
  category: string;
  status: 'pending' | 'completed';
  completed_at: string | null;
  target_date: string | null;
}

export default function BucketListPage() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Adventure 🏕️',
    targetDate: '',
  });

  const categories = [
    'Adventure 🏕️',
    'Travel ✈️',
    'Food & Cooking 🍳',
    'Cozy Nights 🍿',
    'Big Goals 💍',
    'Custom ✨',
  ];

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/bucket-list');
      if (!res.ok) throw new Error('Failed to load bucket list items');
      const json = await res.json();
      setItems(json.items);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bucket-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          targetDate: formData.targetDate || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save bucket item');

      setItems(prev => [json.item, ...prev]);
      setIsCreateOpen(false);
      setFormData({ title: '', category: 'Adventure 🏕️', targetDate: '' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: BucketItem) => {
    const newStatus = item.status === 'pending' ? 'completed' : 'pending';
    try {
      const res = await fetch(`/api/bucket-list/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      const todayStr = new Date().toISOString().split('T')[0];
      setItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? {
                ...i,
                status: newStatus,
                completed_at: newStatus === 'completed' ? todayStr : null,
              }
            : i
        )
      );
    } catch (err) {
      console.error(err);
      alert('Could not update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bucket list goal?')) return;
    try {
      const res = await fetch(`/api/bucket-list/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
      alert('Could not delete item');
    }
  };

  const handleConvertToMilestone = async (item: BucketItem) => {
    try {
      const completionDate = item.completed_at || new Date().toISOString().split('T')[0];
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Bucket List Done: ${item.title}`,
          eventType: 'custom',
          eventDate: completionDate,
          description: `We checked off this goal from our shared bucket list! Category: ${item.category}`,
        }),
      });

      if (!res.ok) throw new Error('Failed to create milestone');
      
      alert('Successfully added to our love timeline! 🌹');
    } catch (err) {
      console.error(err);
      alert('Could not convert to milestone');
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filtered Items
  const filteredItems = items.filter(item => {
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto pb-10 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif italic font-extrabold text-[#3a1e22] flex items-center">
            <Award className="h-6 w-6 mr-2 text-rose-500" /> Shared Bucket List
          </h2>
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            Plan your adventures and check them off as you write your story together
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto shadow-md shadow-pink-500/10 border-0 bg-linear-to-r from-pink-500 to-rose-450 hover:from-pink-600 hover:to-rose-550 text-white font-extrabold uppercase tracking-wide text-xs">
          <Plus className="h-4 w-4 mr-2" /> Add Goal
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60 p-4 rounded-3xl border border-rose-500/5 shadow-xs">
        <div>
          <Select
            label="Filter Status"
            options={[
              { value: 'all', label: 'All Items' },
              { value: 'pending', label: 'Pending Goals' },
              { value: 'completed', label: 'Completed Adventures' },
            ]}
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
          />
        </div>
        <div>
          <Select
            label="Filter Category"
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map(c => ({ value: c, label: c })),
            ]}
            value={categoryFilter}
            onChange={(e: any) => setCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-zinc-100 rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/5 rounded-3xl border border-red-500/10 max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-zinc-800 font-bold">{error}</p>
          <Button onClick={fetchItems} className="mt-4" variant="secondary">Retry</Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card variant="glass" className="p-12 text-center border-rose-500/5 bg-white/45 max-w-lg mx-auto relative overflow-hidden">
          <div className="washi-tape" />
          <CheckSquare className="h-10 w-10 text-rose-300 mb-3 mx-auto animate-pulse" />
          <p className="text-sm font-serif italic font-bold text-zinc-700">No Bucket Goals Found</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-[200px] mx-auto font-medium">
            {statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try modifying your filter settings.'
              : 'Add shared goals like road trips, cooking recipes, or dream dates!'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map(item => (
            <Card
              key={item.id}
              variant="glass"
              className={`hover:border-rose-450/20 transition-all p-5 relative overflow-hidden flex flex-col justify-between ${
                item.status === 'completed' ? 'bg-[#FAF6F3]/60' : 'bg-white/80'
              }`}
            >
              <div className="washi-tape" />
              <div className="flex items-start justify-between space-x-3 pt-2">
                <button
                  onClick={() => handleToggleStatus(item)}
                  className="mt-1 text-pink-500 hover:scale-110 active:scale-90 transition-transform cursor-pointer shrink-0"
                >
                  {item.status === 'completed' ? (
                    <CheckSquare className="h-6 w-6 text-pink-650 fill-rose-50" />
                  ) : (
                    <Square className="h-6 w-6 text-rose-250" />
                  )}
                </button>

                <div className="flex-1 text-left">
                  <h3
                    className={`text-base font-bold text-zinc-850 leading-snug ${
                      item.status === 'completed'
                        ? 'line-through text-zinc-400 font-medium'
                        : ''
                    }`}
                  >
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-sm">
                      {item.category}
                    </span>
                    {item.target_date && item.status === 'pending' && (
                      <span className="text-[9px] font-semibold text-zinc-400 flex items-center bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded-sm">
                        <Calendar className="h-3 w-3 mr-1" /> Target: {formatFriendlyDate(item.target_date)}
                      </span>
                    )}
                    {item.completed_at && (
                      <span className="text-[9px] font-bold text-emerald-650 flex items-center bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-sm">
                        <Sparkles className="h-3 w-3 mr-1" /> Completed: {formatFriendlyDate(item.completed_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-rose-500/5 mt-4 pt-3">
                <div className="flex items-center">
                  {item.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConvertToMilestone(item)}
                      className="text-[10px] font-black uppercase text-pink-600 hover:text-pink-700 flex items-center p-0 h-auto"
                      title="Add to Love Timeline"
                    >
                      <Sparkles className="h-3 w-3 mr-1 text-pink-500 animate-pulse" /> Add to Timeline <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1 h-7 w-7 text-zinc-405 hover:text-red-500 rounded-full"
                  title="Delete Goal"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Bucket List Goal">
        <form onSubmit={handleCreateItem} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl">
              {formError}
            </div>
          )}

          <Input
            label="Goal Title"
            name="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Picnic under cherry blossom trees, Skydiving"
          />

          <Select
            label="Category"
            name="category"
            options={categories.map(c => ({ value: c, label: c }))}
            value={formData.category}
            onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
          />

          <Input
            label="Target Date (Optional)"
            name="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
          />

          <div className="pt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="border-0 bg-linear-to-r from-pink-500 to-rose-450 text-white font-extrabold">
              Add Goal
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
