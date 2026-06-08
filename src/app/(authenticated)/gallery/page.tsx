'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Sparkles, Calendar, BookOpen, Award, AlertCircle } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  date: string;
  description: string;
  photoUrl: string;
  source: 'milestone' | 'memory';
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const loadPhotos = async () => {
    try {
      // Fetch milestones and memories in parallel
      const [milestonesRes, memoriesRes] = await Promise.all([
        fetch('/api/milestones'),
        fetch('/api/memories'),
      ]);

      let milestonePhotos: GalleryItem[] = [];
      let memoryPhotos: GalleryItem[] = [];

      if (milestonesRes.ok) {
        const milestonesJson = await milestonesRes.json();
        milestonePhotos = milestonesJson.milestones
          .filter((m: any) => m.photo_url)
          .map((m: any) => ({
            id: m.id,
            title: m.title,
            date: m.event_date,
            description: m.description || 'Milestone event',
            photoUrl: m.photo_url,
            source: 'milestone' as const,
          }));
      }

      if (memoriesRes.ok) {
        const memoriesJson = await memoriesRes.json();
        memoryPhotos = memoriesJson.memories
          .filter((m: any) => m.image_url)
          .map((m: any) => ({
            id: m.id,
            title: m.title,
            date: m.memory_date,
            description: m.notes || 'Memory entry',
            photoUrl: m.image_url,
            source: 'memory' as const,
          }));
      }

      // Combine and sort by date DESC
      const combined = [...milestonePhotos, ...memoryPhotos].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setItems(combined);
    } catch (err: any) {
      setError('Could not load gallery photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const formatFriendlyDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Safe rotate classes for natural fanned-out look without triggering linter issues
  const rotateClasses = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0', 'rotate-1', '-rotate-1'];

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif italic font-extrabold text-[#3a1e22] flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-rose-500 animate-pulse" /> Polaroid Scrapbook
          </h2>
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            Browse through all the photo memories and milestones captured in our shared journey
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl flex items-center max-w-md">
          <AlertCircle className="h-4 w-4 mr-2" /> {error}
        </div>
      )}

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-zinc-100 rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card variant="glass" className="p-12 text-center border-rose-500/5 bg-white/45 max-w-lg mx-auto relative overflow-hidden">
          <div className="washi-tape" />
          <Sparkles className="h-10 w-10 text-rose-300 mb-3 mx-auto animate-pulse" />
          <p className="text-sm font-serif italic font-bold text-zinc-700">No photos in our scrapbook yet</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-[200px] mx-auto font-medium">
            Add pictures when adding Milestones in the Timeline or writing notes in the Journal!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {items.map((item, idx) => {
            const rotClass = rotateClasses[idx % rotateClasses.length];
            return (
              <div
                key={`${item.source}-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className={`polaroid-frame cursor-pointer hover:scale-103 hover:rotate-0 hover:z-30 transition-all duration-300 relative ${rotClass}`}
              >
                {/* Washi tape on every alternate photo */}
                {idx % 2 === 0 ? <div className="washi-tape" /> : <div className="washi-tape-gold" />}

                <div className="bg-[#FAF3F0] w-full aspect-square overflow-hidden rounded-xs border border-[#f0e6e2] relative group pt-1">
                  {(() => {
                    const lower = item.photoUrl.toLowerCase();
                    const isVid = ['.mp4', '.webm', '.ogg', '.mov'].some(ext => lower.endsWith(ext)) || lower.includes('video') || lower.includes('/uploads/video');
                    if (isVid) {
                      return (
                        <video
                          src={item.photoUrl}
                          className="object-cover w-full h-full"
                          muted
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                      );
                    }
                    return (
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    );
                  })()}
                  
                  {/* Source Badge overlay */}
                  <span className="absolute top-2.5 right-2.5 text-[8px] font-black uppercase tracking-wider bg-white/90 text-rose-600 px-2 py-0.5 rounded-sm border border-rose-100 shadow-xs flex items-center">
                    {item.source === 'milestone' ? (
                      <Award className="h-2.5 w-2.5 mr-1 text-pink-500" />
                    ) : (
                      <BookOpen className="h-2.5 w-2.5 mr-1 text-pink-500" />
                    )}
                    {item.source}
                  </span>
                </div>

                <div className="text-left py-3.5 px-1">
                  <h3 className="font-serif italic font-bold text-base text-zinc-800 leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[9px] text-zinc-400 font-bold flex items-center mt-1 uppercase tracking-wider">
                    <Calendar className="h-3 w-3 mr-1 text-rose-400" /> {formatFriendlyDate(item.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHOTO PREVIEW MODAL DIALOG */}
      <Dialog
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title="Polaroid Scrapbook Details"
        size="md"
      >
        {selectedItem && (
          <div className="space-y-4 pt-3 text-center">
            <div className="washi-tape-gold" />
            
            <div className="polaroid-frame inline-block max-w-full rotate-0">
              <div className="rounded-xs overflow-hidden max-h-[450px] border border-zinc-150">
                {(() => {
                  const lower = selectedItem.photoUrl.toLowerCase();
                  const isVid = ['.mp4', '.webm', '.ogg', '.mov'].some(ext => lower.endsWith(ext)) || lower.includes('video') || lower.includes('/uploads/video');
                  if (isVid) {
                    return (
                      <video
                        src={selectedItem.photoUrl}
                        className="object-contain max-h-[450px] mx-auto w-full"
                        controls
                        autoPlay
                      />
                    );
                  }
                  return (
                    <img
                      src={selectedItem.photoUrl}
                      alt={selectedItem.title}
                      className="object-contain max-h-[450px] mx-auto w-full"
                    />
                  );
                })()}
              </div>
              <div className="text-left mt-4 px-1 space-y-1.5">
                <h3 className="font-serif italic font-extrabold text-xl text-zinc-900 leading-tight">
                  {selectedItem.title}
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-rose-400" /> Captured on {formatFriendlyDate(selectedItem.date)}
                </p>
                {selectedItem.description && (
                  <p className="text-xs text-zinc-650 font-medium leading-relaxed italic border-l border-rose-200 pl-2 pt-1 mt-2">
                    "{selectedItem.description}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button onClick={() => setSelectedItem(null)} className="shadow-md shadow-pink-500/10 border-0 bg-linear-to-r from-pink-500 to-rose-450 text-white font-extrabold">
                Close View
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
