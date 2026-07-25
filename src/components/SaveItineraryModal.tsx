'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { CheckCircle, X, Save, CloudUpload, Loader2, MapPin, Clock, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trips as tripsApi } from '@/lib/api';
import {
  LocalItinerary,
  saveItineraryLocally,
  generateLocalId,
} from '@/lib/itinerary-storage';

interface SaveItineraryModalProps {
  slots: {
    slotIndex: number;
    time: string;
    timeRange: string;
    isTomorrow: boolean;
    scheduledFor?: string;
    destination: {
      id: string;
      title: string;
      category: string;
      image: string;
      location: string;
      rating: number;
    };
  }[];
  onClose: () => void;
  onOpenAuthModal?: () => void;
}

export default function SaveItineraryModal({
  slots,
  onClose,
  onOpenAuthModal,
}: SaveItineraryModalProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const defaultTitle = `Perjalananku di Jogja — ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const [title, setTitle] = useState(defaultTitle);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedLocation, setSavedLocation] = useState<'local' | 'cloud' | null>(null);

  async function handleSaveToCloud() {
    setSaveState('saving');
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await tripsApi.create({
        title: title.trim() || defaultTitle,
        start_date: today,
        duration_days: 1,
        days: [
          {
            dayNumber: 1,
            destinationIds: slots.map((s) => s.destination.id),
            notes: '',
          },
        ],
        status: 'draft',
      });
      if (res.status === 'success') {
        setSaveState('saved');
        setSavedLocation('cloud');
      } else {
        setSaveState('error');
      }
    } catch {
      setSaveState('error');
    }
  }

  function handleSaveLocally() {
    setSaveState('saving');
    const itinerary: LocalItinerary = {
      id: generateLocalId(),
      title: title.trim() || defaultTitle,
      createdAt: new Date().toISOString(),
      slots,
    };
    saveItineraryLocally(itinerary);
    setSaveState('saved');
    setSavedLocation('local');
  }

  function handleViewTrips() {
    router.push('/planner');
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,196,0,0.12)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-white/10"
          style={{ background: 'rgba(255,196,0,0.07)' }}
        >
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4 text-gold-400" />
            <span className="text-[13px] font-bold text-white">Simpan Itinerary</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {saveState === 'saved' ? (
          /* ─── Success state ─── */
          <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{ background: 'rgba(74,222,128,0.15)', border: '1.5px solid rgba(74,222,128,0.4)' }}
            >
              <CheckCircle className="h-7 w-7 text-green-400" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-white mb-1">
                {savedLocation === 'cloud' ? 'Tersimpan ke Akun! ☁️' : 'Tersimpan di Perangkat! 💾'}
              </p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {savedLocation === 'cloud'
                  ? 'Itinerary kamu tersimpan permanen dan bisa diakses dari perangkat manapun.'
                  : 'Itinerary tersimpan di perangkat ini. Login untuk menyimpan permanen ke akunmu.'}
              </p>
            </div>
            <div className="flex gap-2 mt-2 w-full">
              <button
                onClick={handleViewTrips}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold text-black cursor-pointer transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ffd700, #ffb300)' }}
              >
                Lihat Itinerary ↗
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white/70 hover:text-white border border-white/15 hover:border-white/30 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
            {savedLocation === 'local' && !isAuthenticated && (
              <button
                onClick={() => { onClose(); onOpenAuthModal?.(); }}
                className="w-full py-2 rounded-xl text-[11px] font-semibold text-gold-400 border border-gold-400/30 hover:bg-gold-400/10 transition-all cursor-pointer"
              >
                🔑 Login & Sync ke Akun
              </button>
            )}
          </div>
        ) : (
          /* ─── Default state ─── */
          <div className="px-5 py-4 flex flex-col gap-4">
            {/* Trip name input */}
            <div>
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-wide block mb-1.5">
                Nama Trip
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid rgba(255,196,0,0.5)')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)')}
                placeholder="Nama perjalananmu..."
              />
            </div>

            {/* Itinerary preview */}
            <div>
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-wide block mb-2">
                Ringkasan Perjalanan
              </label>
              <div className="flex flex-col gap-2">
                {slots.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {/* Destination image */}
                    {slot.destination.image ? (
                      <img
                        src={slot.destination.image}
                        alt={slot.destination.title}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-base"
                        style={{ background: 'rgba(255,196,0,0.15)' }}
                      >
                        📍
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{slot.destination.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[9px] text-gold-400/80">
                          <Clock className="h-2.5 w-2.5" />
                          {slot.isTomorrow ? slot.scheduledFor || 'Besok' : slot.time}
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px] text-white/40">
                          <MapPin className="h-2.5 w-2.5" />
                          {slot.destination.location}
                        </span>
                      </div>
                    </div>
                    {slot.destination.rating > 0 && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Star className="h-2.5 w-2.5 text-gold-400 fill-gold-400" />
                        <span className="text-[9px] font-bold text-gold-400">{slot.destination.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {/* Logged in: primary = save to cloud */}
                  <button
                    onClick={handleSaveToCloud}
                    disabled={saveState === 'saving'}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-bold text-black cursor-pointer transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #ffd700, #ffb300)' }}
                  >
                    {saveState === 'saving' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CloudUpload className="h-4 w-4" />
                    )}
                    {saveState === 'saving' ? 'Menyimpan...' : 'Simpan ke Akun ☁️'}
                  </button>
                  <button
                    onClick={handleSaveLocally}
                    disabled={saveState === 'saving'}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-[12px] font-semibold text-white/70 hover:text-white border border-white/15 hover:border-white/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Simpan Lokal Saja
                  </button>
                </>
              ) : (
                <>
                  {/* Guest: primary = save locally, secondary = login & sync */}
                  <button
                    onClick={handleSaveLocally}
                    disabled={saveState === 'saving'}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-bold text-black cursor-pointer transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #ffd700, #ffb300)' }}
                  >
                    <Save className="h-4 w-4" />
                    Simpan di Perangkat 💾
                  </button>
                  <button
                    onClick={() => { onClose(); onOpenAuthModal?.(); }}
                    disabled={saveState === 'saving'}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-[12px] font-semibold text-gold-400 border border-gold-400/30 hover:bg-gold-400/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CloudUpload className="h-3.5 w-3.5" />
                    🔑 Login & Simpan ke Akun
                  </button>
                </>
              )}
              {saveState === 'error' && (
                <p className="text-[11px] text-red-400 text-center">
                  Gagal menyimpan ke server. Coba lagi atau simpan lokal.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
