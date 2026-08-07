'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { businessInvites, BusinessInvitePreview, BusinessInviteAcceptResult } from '@/lib/api';
import Image from 'next/image';
import {
  CheckCircle2, AlertCircle, Loader2, Shield, UserPlus,
  Building2, Mail, ArrowRight,
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const ROLE_LABEL: Record<string, string> = {
  owner: 'Pemilik',
  admin: 'Admin',
};

type PageState =
  | { phase: 'loading' }
  | { phase: 'login-gate' }
  | { phase: 'error'; title: string; message: string; alreadyAccepted?: boolean }
  | { phase: 'ready'; preview: BusinessInvitePreview }
  | { phase: 'success'; result: BusinessInviteAcceptResult };

function friendlyInviteError(raw: string): { title: string; message: string; alreadyAccepted?: boolean } {
  const s = (raw || '').toLowerCase();
  if (s.includes('already accepted') || s.includes('sudah diterima'))
    return { title: 'Undangan Sudah Diterima', message: 'Anda sudah menjadi anggota tim bisnis ini. Silakan buka dasbor bisnis Anda.', alreadyAccepted: true };
  if (s.includes('revoked') || s.includes('dibatalkan oleh pemilik'))
    return { title: 'Undangan Dibatalkan', message: 'Undangan ini sudah dibatalkan oleh pemilik bisnis.' };
  if (s.includes('expired') || s.includes('kedaluwarsa'))
    return { title: 'Undangan Kedaluwarsa', message: 'Link undangan ini sudah kedaluwarsa. Hubungi pemilik bisnis untuk undangan baru.' };
  if (s.includes('email mismatch') || s.includes('ditujukan untuk'))
    return { title: 'Akun Tidak Sesuai', message: raw || 'Undangan ini ditujukan untuk email yang berbeda. Silakan masuk dengan akun yang benar.' };
  if (s.includes('unauthorized') || s.includes('unauthenticated') || s.includes('sesi'))
    return { title: 'Sesi Berakhir', message: 'Silakan masuk kembali untuk melanjutkan.' };
  if (s.includes('not found') || s.includes('tidak ditemukan'))
    return { title: 'Undangan Tidak Ditemukan', message: 'Link undangan tidak valid atau sudah dihapus.' };
  return { title: 'Gagal Memuat Undangan', message: raw || 'Terjadi kesalahan. Silakan coba beberapa saat lagi.' };
}

function InviteContent() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<PageState>({ phase: 'loading' });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!token) {
      setState({ phase: 'error', title: 'Undangan Tidak Ditemukan', message: 'Link undangan tidak valid.' });
      return;
    }
    try {
      const res = await businessInvites.preview(token);
      if (res.status === 'success' && res.data) {
        setState({ phase: 'ready', preview: res.data });
      } else {
        setState({ phase: 'error', ...friendlyInviteError(res.message || '') });
      }
    } catch {
      setState({ phase: 'error', ...friendlyInviteError('') });
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPreview();
    } else {
      setState({ phase: 'login-gate' });
    }
  }, [isAuthenticated, loadPreview]);

  const handleAccept = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await businessInvites.accept(token);
      if (res.status === 'success' && res.data) {
        setState({ phase: 'success', result: res.data });
        setTimeout(() => router.push('/business'), 1800);
      } else {
        setState({ phase: 'error', ...friendlyInviteError(res.message || '') });
      }
    } catch {
      setState({ phase: 'error', ...friendlyInviteError('') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSuccess = async () => {
    setShowAuthModal(false);
    setState({ phase: 'loading' });
    await loadPreview();
  };

  const goToDashboard = () => {
    router.push('/business');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-6 relative overflow-hidden bg-stone-950">
      <Image src="/merapi.png" alt="Gunung Merapi" fill priority className="object-cover object-center" />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 w-full max-w-md bg-[#FAF6EF] rounded-none md:rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,.65)]">
        <div className="p-6 md:p-8 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              <Image src="/logo-gold-new.png" alt="Jogjagem" width={16} height={16} className="object-contain" />
              Undangan Tim Bisnis
            </div>
          </div>

          {state.phase === 'loading' && (
            <div className="flex items-center justify-center py-16 text-stone-400 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <span className="text-xs font-semibold">Memeriksa undangan...</span>
            </div>
          )}

          {state.phase === 'login-gate' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-stone-900">Anda Diundang ke Tim Bisnis</h1>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  Masuk atau daftar untuk melihat detail undangan dan bergabung
                  sebagai anggota tim.
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full py-3 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Masuk / Daftar
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {state.phase === 'error' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-stone-900">{state.title}</h1>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{state.message}</p>
              </div>
              {state.alreadyAccepted && (
                <button
                  onClick={goToDashboard}
                  className="w-full py-3 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Buka Dasbor Bisnis
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {state.phase === 'ready' && (
            <>
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                      Bisnis
                    </p>
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {state.preview.business_name}
                    </p>
                    {state.preview.invited_by_name && (
                      <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                        Diundang oleh {state.preview.invited_by_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                      Peran Anda
                    </p>
                    <p className="text-sm font-bold text-stone-900 capitalize">
                      {ROLE_LABEL[state.preview.role] ?? state.preview.role}
                    </p>
                    <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                      {state.preview.role === 'owner'
                        ? 'Dapat mengelola seluruh data, anggota, dan pengaturan bisnis.'
                        : 'Dapat mengelola konten dan operasional bisnis.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                      Email Undangan
                    </p>
                    <p className="text-sm font-bold text-stone-900 truncate">{state.preview.email}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAccept}
                disabled={submitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Terima Undangan
                  </>
                )}
              </button>
              <p className="text-[10px] text-stone-400 text-center">
                Dengan menerima, Anda dapat langsung mengelola bisnis ini dari
                dasbor bisnis.
              </p>
            </>
          )}

          {state.phase === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-stone-900">
                  Selamat Bergabung!
                </h1>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  Anda sekarang menjadi{' '}
                  <b className="text-stone-700 capitalize">
                    {ROLE_LABEL[state.result.role] ?? state.result.role}
                  </b>{' '}
                  di bisnis <b className="text-stone-700">{state.result.business_name}</b>.
                  Mengarahkan ke dasbor...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-stone-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[11px] font-medium">Membuka dasbor bisnis</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function BusinessInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white text-xs">
        Loading...
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
