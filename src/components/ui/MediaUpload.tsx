'use client';

import React, { useState, useRef } from 'react';
import { Upload, Loader2, X, Film, Image as ImageIcon } from 'lucide-react';
import { Input } from './Input';

interface MediaUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  accept?: string;
  containerClassName?: string;
}

export function MediaUpload({
  label,
  value,
  onChange,
  placeholder = 'e.g. URL starting with https:// or upload a file',
  accept = 'image/*,video/*',
  containerClassName = '',
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Upload failed');
      }

      onChange(json.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isVideo = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.mov'];
    const lower = url.toLowerCase();
    return videoExtensions.some(ext => lower.endsWith(ext)) || lower.includes('video') || lower.includes('/uploads/video');
  };

  return (
    <div className={`flex flex-col space-y-2 w-full ${containerClassName}`}>
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Input
            label={label}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            error={error}
          />
        </div>
        
        <div className="shrink-0 pb-px">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-pink-650 hover:bg-rose-100/70 font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors disabled:opacity-50 h-[42px] cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
            ) : (
              <Upload className="h-4 w-4 text-pink-500" />
            )}
            <span>Upload</span>
          </button>
        </div>
      </div>

      {value && (
        <div className="relative group self-start border border-rose-100 rounded-2xl p-1 bg-white shadow-xs max-w-xs animate-fade-in">
          {isVideo(value) ? (
            <div className="relative flex items-center justify-center bg-zinc-950 rounded-xl overflow-hidden h-28 w-44">
              <video src={value} className="h-full w-full object-cover" controls />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-sm flex items-center">
                <Film className="h-2.5 w-2.5 mr-1" /> Video
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden h-28 w-44 bg-zinc-50 border border-zinc-100">
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-sm flex items-center">
                <ImageIcon className="h-2.5 w-2.5 mr-1" /> Image
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-650 shadow-md transition-colors"
            title="Remove Media"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
