'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Textarea } from '@/components/ui/Input';
import { MapPin, Calendar, Trash2, Plus, Sparkles, AlertCircle, Heart } from 'lucide-react';

interface LovePin {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  lat: number; // Used as Y percentage (0-100) on SVG
  lng: number; // Used as X percentage (0-100) on SVG
  visit_date: string;
}

export default function LoveMapPage() {
  const [pins, setPins] = useState<LovePin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<LovePin | null>(null);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visitDate: new Date().toISOString().split('T')[0],
    xPercent: 50,
    yPercent: 50,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPins = async () => {
    try {
      const res = await fetch('/api/love-map');
      if (!res.ok) throw new Error('Failed to load map pins');
      const json = await res.json();
      setPins(json.pins);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData({
      title: '',
      description: '',
      visitDate: new Date().toISOString().split('T')[0],
      xPercent: Math.round(x * 100) / 100,
      yPercent: Math.round(y * 100) / 100,
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleCreatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/love-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          lat: formData.yPercent, // lat matches Y
          lng: formData.xPercent, // lng matches X
          visitDate: formData.visitDate,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to pin location');

      setPins(prev => [...prev, json.pin]);
      setIsCreateOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save pin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePin = async (id: string) => {
    if (!confirm('Are you sure you want to remove this pin?')) return;
    try {
      const res = await fetch(`/api/love-map/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete pin');
      setPins(prev => prev.filter(p => p.id !== id));
      if (selectedPin?.id === id) {
        setSelectedPin(null);
      }
    } catch (err) {
      console.error(err);
      alert('Could not remove pin');
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif italic font-extrabold text-[#3a1e22] flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-rose-500 animate-bounce" /> Our Love Map
          </h2>
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            Click anywhere on our custom vector pinboard map to pin a location we've visited together
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl flex items-center max-w-md">
          <AlertCircle className="h-4 w-4 mr-2" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Interactive SVG World Map Canvas */}
        <Card variant="glass" className="lg:col-span-2 p-4 md:p-6 bg-white/80 border-rose-500/10 relative overflow-hidden">
          <div className="washi-tape" />
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 pt-2">
            Interactive Pinboard Canvas
          </h3>
          
          <div className="relative border border-[#f5eae5] rounded-2xl bg-[#faf6f3] overflow-hidden aspect-video shadow-inner select-none cursor-crosshair">
            {/* Grid paper lines overlay */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'radial-gradient(#db2777 0.5px, transparent 0.5px), radial-gradient(#db2777 0.5px, #faf6f3 0.5px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px'
            }} />

            {/* Simplistic stylized scrapbook SVG map of the world */}
            <svg
              viewBox="0 0 1000 562.5"
              className="w-full h-full opacity-60 text-rose-200 fill-current stroke-rose-300 stroke-1 stroke-linejoin-round"
              onClick={handleMapClick}
            >
              {/* North America */}
              <path d="M 50,150 L 120,80 L 250,50 L 320,60 L 300,180 L 250,170 L 200,280 L 150,290 L 160,320 L 120,310 Z" />
              {/* South America */}
              <path d="M 200,280 L 250,280 L 280,310 L 300,380 L 270,480 L 240,510 L 230,450 L 210,380 L 180,320 Z" />
              {/* Greenland */}
              <path d="M 320,30 L 380,20 L 410,40 L 360,90 L 320,70 Z" />
              {/* Eurasia (Europe + Asia) */}
              <path d="M 450,120 L 520,70 L 680,60 L 850,70 L 920,130 L 950,180 L 900,250 L 850,290 L 800,280 L 750,320 L 720,250 L 650,280 L 600,290 L 520,250 L 480,240 L 460,180 Z" />
              {/* Africa */}
              <path d="M 480,240 L 530,240 L 580,270 L 630,290 L 610,380 L 580,450 L 540,430 L 520,380 L 470,300 L 450,270 Z" />
              {/* Australia */}
              <path d="M 800,380 L 860,370 L 890,410 L 870,460 L 810,450 L 780,410 Z" />
              {/* Islands */}
              <circle cx="850" cy="230" r="10" />
              <circle cx="880" cy="260" r="8" />
              <circle cx="780" cy="310" r="12" />
            </svg>

            {/* Pinned Hearts */}
            {pins.map((pin) => (
              <button
                key={pin.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin(pin);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform text-pink-600 focus:outline-none z-20 active:scale-90"
                style={{
                  left: `${pin.lng}%`,
                  top: `${pin.lat}%`,
                }}
              >
                <div className="relative group">
                  <MapPin className="h-6 w-6 fill-rose-200" />
                  <Heart className="h-3 w-3 fill-pink-650 absolute top-[4px] left-[6px] text-pink-650" />
                  
                  {/* Tooltip on hover */}
                  <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-zinc-900 text-white text-[10px] py-1 px-2.5 rounded-md shadow-md font-bold">
                    {pin.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Pin Details / Polaroid Display panel */}
        <div className="space-y-6">
          {selectedPin ? (
            <div className="polaroid-frame relative w-full aspect-4/5 flex flex-col justify-between pt-5">
              <div className="washi-tape-gold" />
              
              <div className="bg-[#FAF3F0] w-full aspect-square relative flex items-center justify-center text-rose-300 border border-[#f0e6e2] rounded-xs overflow-hidden">
                <MapPin className="h-16 w-16 text-rose-400/30 animate-pulse" />
                <div className="absolute bottom-3 right-3 text-[9px] font-bold tracking-wide uppercase bg-rose-50 text-rose-600 px-2 py-0.5 rounded-sm">
                  📍 {Math.round(selectedPin.lng)}°W, {Math.round(selectedPin.lat)}°N
                </div>
              </div>

              <div className="text-left py-2 px-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif italic text-lg font-extrabold text-zinc-900 leading-snug">
                    {selectedPin.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-semibold flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" /> Visited {formatFriendlyDate(selectedPin.visit_date)}
                  </p>
                  {selectedPin.description && (
                    <p className="text-xs text-zinc-600 mt-3 italic leading-normal border-l border-rose-350 pl-2">
                      "{selectedPin.description}"
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-3 border-t border-rose-500/5 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePin(selectedPin.id)}
                    className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 rounded-full h-8 w-8 p-0"
                    title="Remove Pin"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card variant="glass" className="p-6 text-center border-rose-500/5 bg-white/70 h-full flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
              <div className="washi-tape" />
              <MapPin className="h-10 w-10 text-rose-300 mb-3 animate-pulse" />
              <p className="text-sm font-serif italic font-bold text-zinc-700">No Location Selected</p>
              <p className="text-xs text-zinc-400 mt-1.5 max-w-[200px] mx-auto font-medium">
                Click any pink pin on the map to open the polaroid card, or click anywhere on the canvas to place a new pin.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* CREATE PIN MODAL DIALOG */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Pin A New Memory">
        <form onSubmit={handleCreatePin} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-2xl">
              {formError}
            </div>
          )}

          <Input
            label="Location Name"
            name="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Paris Café, Eiffel Tower, Our Picnic Spot"
          />

          <Input
            label="Visit Date"
            name="visitDate"
            type="date"
            required
            value={formData.visitDate}
            onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
          />

          <Textarea
            label="Short Memory Note"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What did we do here? Tell the story..."
          />

          <div className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100/50 text-[10px] text-zinc-400 font-semibold flex items-center justify-between">
            <span>Coordinates (SVG Relative):</span>
            <span>X: {formData.xPercent}%, Y: {formData.yPercent}%</span>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="border-0 bg-linear-to-r from-pink-500 to-rose-450 text-white font-extrabold">
              Pin Location
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
