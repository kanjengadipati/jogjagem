'use client';

import React, { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationId: string;
  onReport: (reason: string, details: string) => Promise<void>;
}

const REASONS = [
  "Gambar tidak sesuai",
  "Melanggar hak cipta",
  "Konten tidak pantas",
  "Kualitas gambar rendah",
  "Lainnya"
];

export default function ReportModal({ isOpen, onClose, destinationId, onReport }: ReportModalProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onReport(reason, details);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-red-100 rounded-full text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-royal-950">Laporkan Konten</h2>
        </div>

        <div className="space-y-3 mb-6">
          {REASONS.map((r) => (
            <label key={r} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-50">
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={(e) => setReason(e.target.value)} className="text-gold-500 focus:ring-gold-500" />
              <span className="text-sm text-stone-700">{r}</span>
            </label>
          ))}
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Detail tambahan (opsional)..."
            className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-gold-500"
            rows={3}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-2xl bg-royal-950 hover:bg-royal-900 text-white font-semibold transition-all disabled:opacity-50"
        >
          {submitting ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </div>
    </div>
  );
}
