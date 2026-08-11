import React, { useRef, useState, useEffect } from 'react';
import { Search, X, Camera, Mic, MicOff, Loader2 } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e?: React.FormEvent) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  showImageSearch?: boolean;
  showVoiceSearch?: boolean;
  onImageSearch?: (file: File) => void;
  onVoiceSearch?: () => void;
  isUploadingImage?: boolean;
  isListening?: boolean;
  /** Rotating clickable search suggestions shown while the input is empty. */
  rotatingClues?: string[];
  /** Called with the clicked clue — parent should set the value and submit. */
  onRotatingClueClick?: (clue: string) => void;
}

const CLUE_ROTATE_MS = 3500;

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Cari destinasi, aktivitas, atau pengalaman...',
  className = '',
  id = 'search-bar-form',
  showImageSearch = false,
  showVoiceSearch = false,
  onImageSearch,
  onVoiceSearch,
  isUploadingImage = false,
  isListening = false,
  rotatingClues = [],
  onRotatingClueClick,
}: SearchBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clueIndex, setClueIndex] = useState(0);

  useEffect(() => {
    if (rotatingClues.length < 2 || value) return;
    const timer = setInterval(() => {
      setClueIndex(prev => (prev + 1) % rotatingClues.length);
    }, CLUE_ROTATE_MS);
    return () => clearInterval(timer);
  }, [rotatingClues.length, value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSearch) {
      onImageSearch(file);
    }
  };

  const currentClue = rotatingClues.length > 0 ? rotatingClues[clueIndex % rotatingClues.length] : '';
  const showingClue = !value && !!currentClue && !!onRotatingClueClick;

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={`relative flex items-center rounded-full border border-white/20 bg-black/35 hover:bg-black/45 backdrop-blur-md p-1 shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-gold-500/50 focus-within:border-gold-400 overflow-hidden ${className}`}
    >
      <Search className="ml-3.5 sm:ml-4 h-4.5 w-4.5 sm:h-5 sm:w-5 text-white/70 shrink-0 pointer-events-none" />
      <div className="relative w-full">
        <input
          type="text"
          placeholder={showingClue ? '' : placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent py-2.5 sm:py-3 pl-2.5 pr-20 text-xs sm:text-sm text-white placeholder-white/60 focus:outline-none font-sans"
        />
        {showingClue && (
          <button
            type="button"
            onClick={() => onRotatingClueClick(currentClue)}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pr-20 w-[calc(100%-0.625rem)] text-left text-xs sm:text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
            title={currentClue}
          >
            <span key={clueIndex} className="truncate animate-fade-in">{currentClue}</span>
          </button>
        )}
      </div>
      {showImageSearch && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
      <div className="absolute right-1 flex items-center space-x-1">
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all shrink-0 cursor-pointer"
            title="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {showImageSearch && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all shrink-0 disabled:opacity-50 cursor-pointer"
            title="Cari dengan gambar"
          >
            {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
        )}
        {showVoiceSearch && (
          <button
            type="button"
            onClick={onVoiceSearch}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-all shrink-0 cursor-pointer ${
              isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10 text-white/70 hover:text-white'
            }`}
            title="Cari dengan suara"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
        <button
          type="submit"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gold-500 hover:bg-gold-600 active:scale-95 text-royal-950 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Search className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
    </form>
  );
}
