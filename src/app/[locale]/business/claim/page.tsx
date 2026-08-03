'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { businesses, listingClaims, BeBusiness, SearchResult } from '@/lib/api';
import Image from 'next/image';
import { Briefcase, CheckCircle2, Shield, AlertCircle, ArrowLeft, Building2, Plus, Search, Loader2 } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useLocale } from '@/contexts/LocaleContext';

const CATEGORIES = ['Kuliner', 'Hotel & Penginapan', 'Wisata & Destinasi', 'Oleh-oleh', 'Jasa', 'Lainnya'];



function friendlyClaimError(raw: string): string {
  const s = (raw || '').toLowerCase();
  if (s.includes('not an owner') || s.includes('forbidden') || s.includes('bukan pemilik')) {
    return 'Anda bukan pemilik bisnis yang dipilih. Silakan pilih bisnis yang benar.';
  }
  if (s.includes('already claimed') || s.includes('already owned') || s.includes('conflict')) {
    return 'Listing ini sudah diklaim oleh bisnis lain.';
  }
  if (s.includes('invalid listing type') || s.includes('unsupported listing')) {
    return 'Jenis listing tidak didukung untuk klaim kepemilikan.';
  }
  if (s.includes('not found') || s.includes('tidak ditemukan')) {
    return 'Listing tidak ditemukan. Periksa kembali ID listing yang dimasukkan.';
  }
  if (s.includes('permission') || s.includes('unauthorized') || s.includes('unauthenticated')) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }
  if (s.includes('validation') || s.includes('required')) {
    return 'Data yang dimasukkan tidak lengkap atau tidak valid.';
  }
  return 'Gagal mengirim klaim. Silakan coba beberapa saat lagi.';
}

function extractDataArray<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
}

function extractDataObj<T>(res: any): T | null {
  if (!res) return null;
  if (res.id) return res as T;
  if (res.data?.id) return res.data as T;
  if (res.data?.data?.id) return res.data.data as T;
  return null;
}

function validatePhone(phone: string): boolean {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return true;
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  if (digitsOnly.length < 9 || digitsOnly.length > 15) return false;
  return /^(\+62|62|0)[8][1-9][0-9]{6,11}$/.test(cleanPhone);
}

function ClaimFormContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawType = searchParams.get('type') || 'destination';
  const listingType = rawType === 'culinary' ? 'restaurant' : rawType === 'shopping' ? 'souvenir' : rawType === 'accommodation' ? 'hotel' : rawType === 'attraction' ? 'destination' : rawType;
  const listingId = searchParams.get('listingId') || '';
  const listingName = searchParams.get('name') || '';

  const [manualListingId, setManualListingId] = useState('');
  const [selectedListingId, setSelectedListingId] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const targetListingId = listingId || selectedListingId || manualListingId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedListingId(''); // Reset selection if typing
    const search = async () => {
      if (manualListingId.length < 3) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await listingClaims.search(manualListingId);
        setSearchResults(res.data ?? []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [manualListingId]);

  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [myBusinesses, setMyBusinesses] = useState<BeBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BeBusiness | 'new'>('new');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New business inline creation state
  const [newBizData, setNewBizData] = useState({
    name: '',
    category: listingType === 'hotel' ? 'Hotel & Penginapan' : listingType === 'restaurant' ? 'Kuliner' : listingType === 'souvenir' ? 'Oleh-oleh' : 'Wisata & Destinasi',
    phone: '',
    description: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadBusinesses();
    } else {
      setLoading(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_return_to', window.location.pathname + window.location.search);
      }
    }
  }, [isAuthenticated]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await businesses.getMine();
      const list = extractDataArray<BeBusiness>(data);
      setMyBusinesses(list);
      if (list.length > 0) {
        setSelectedBusiness(list[0]);
      } else {
        setSelectedBusiness('new');
      }
    } catch {
      setMyBusinesses([]);
      setSelectedBusiness('new');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setSubmitting(true);
    setResultMessage(null);

    try {
      let targetBusinessExternalId = '';

      if (selectedBusiness === 'new') {
        if (!newBizData.name.trim()) {
          setResultMessage({ type: 'error', text: 'Nama bisnis wajib diisi.' });
          setSubmitting(false);
          return;
        }
        if (newBizData.phone.trim() && !validatePhone(newBizData.phone)) {
          setResultMessage({ type: 'error', text: 'Nomor telepon / WhatsApp tidak valid (Contoh: 081234567890 atau +6281234567890).' });
          setSubmitting(false);
          return;
        }
        const bizRes = await businesses.create(newBizData);
        if (bizRes.status === 'error') {
          throw new Error(bizRes.message || 'Gagal mendaftarkan bisnis baru.');
        }
        const rawBiz = (bizRes as any)?.data ?? (bizRes as any);
        targetBusinessExternalId = String(rawBiz?.external_id ?? rawBiz?.data?.external_id ?? '');
      } else {
        const biz = selectedBusiness as any;
        targetBusinessExternalId = String(biz?.external_id ?? biz?.data?.external_id ?? '');
      }

      if (!targetBusinessExternalId) {
        throw new Error('Gagal mendapatkan identitas bisnis. Silakan refresh halaman dan coba lagi.');
      }

      if (!targetListingId.trim()) {
        setResultMessage({ type: 'error', text: 'Silakan isi ID / Nama listing yang hendak diklaim.' });
        setSubmitting(false);
        return;
      }

      const claimRes = await listingClaims.submit({
        business_external_id: targetBusinessExternalId,
        listing_type: listingType,
        listing_external_id: targetListingId
      });
      if (claimRes.status === 'error') {
        throw new Error(friendlyClaimError(claimRes.message || ''));
      }

      setResultMessage({
        type: 'success',
        text: 'Klaim kepemilikan berhasil dikirim! Tim Jogjagem akan meninjau klaim Anda dalam 1×24 jam.'
      });
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      setResultMessage({
        type: 'error',
        text: friendlyClaimError(raw) 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnToBusiness = () => {
    router.push('/business');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0d] flex items-center justify-center p-4 md:p-10">
      <div className="fixed inset-0 z-0">
        <Image src="/prambanan-bg.png" alt="Candi Prambanan" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-md" />
      </div>

      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReturnToBusiness}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-stone-900">{t('business_claim.title')}</h1>
            <p className="text-xs text-stone-500">{t('business_claim.subtitle')}</p>
          </div>
        </div>

        <div className="p-3.5 bg-gold-50 border border-gold-200/60 rounded-2xl flex items-start gap-3 text-xs text-gold-900">
          <Shield className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
          <div className="w-full">
             <span className="font-bold text-[11px] text-gold-800 uppercase tracking-wider block">{t('business_claim.target_listing')}</span>
            {listingName || listingId ? (
              <>
                <span className="font-bold text-stone-900 text-sm block mt-0.5">{listingName || listingId}</span>
                <span className="text-[11px] text-stone-600 block mt-0.5">
                   {t('business_claim.category')} <span className="capitalize font-medium">{listingType}</span>
                </span>
              </>
            ) : (
              <div className="mt-1 space-y-1.5 relative" ref={searchRef}>
                 <span className="text-xs text-stone-600 block font-medium">{t('business_claim.search_prompt')}</span>
                <div className="relative">
                  <input
                    type="text"
                     placeholder={t('business_claim.search_placeholder')}
                    value={manualListingId}
                    onChange={(e) => setManualListingId(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white font-mono focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1.5" />
                  {searching && <Loader2 className="w-4 h-4 animate-spin text-gold-500 absolute right-2.5 top-1.5" />}
                </div>
                {showResults && searchResults.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white border border-stone-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {searchResults.map((r) => (
                        <li
                          key={`${r.listing_type}:${r.id}`}
                          className="px-3 py-2 text-xs hover:bg-stone-100 cursor-pointer border-b last:border-0 border-stone-100"
                          onClick={() => {
                            setManualListingId(r.name);
                            setSelectedListingId(r.id);
                            setShowResults(false);
                          }}
                        >
                          <div className="font-semibold text-stone-900">{r.name}</div>
                          <div className="text-[10px] text-stone-500 capitalize">{r.listing_type}</div>
                        </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {resultMessage && (
          <div className={`p-4 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${resultMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
            {resultMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            <div className="leading-relaxed">{resultMessage.text}</div>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-xs text-stone-600">{t('business_claim.must_login')}</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 bg-royal-950 hover:bg-royal-900 text-white font-semibold text-xs rounded-xl transition-colors shadow-md"
            >
              {t('business_claim.login_btn')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleClaim} className="space-y-4">
            {loading ? (
              <div className="text-xs text-stone-400 py-4 text-center">Memuat data bisnis Anda...</div>
            ) : (
              <>
                {myBusinesses.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">{t('business_claim.choose_business')}</label>
                    <select
                      value={selectedBusiness === 'new' ? 'new' : String((selectedBusiness as any).id || (selectedBusiness as any).ID || '')}
                      disabled={resultMessage?.type === 'success' || submitting}
                      onChange={(e) => {
                        if (e.target.value === 'new') {
                          setSelectedBusiness('new');
                        } else {
                          const found = myBusinesses.find(b => String((b as any).id || (b as any).ID) === e.target.value);
                          if (found) setSelectedBusiness(found);
                        }
                      }}
                      className="w-full px-3 py-2.5 text-xs font-medium border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white disabled:bg-stone-100 disabled:text-stone-500"
                    >
                      {myBusinesses.map((b) => (
                        <option key={(b as any).id || (b as any).ID} value={String((b as any).id || (b as any).ID)}>
                          {b.name} ({b.category})
                        </option>
                      ))}
                      <option value="new">+ {t('business_claim.register_new')}</option>
                    </select>
                  </div>
                )}

                {(myBusinesses.length === 0 || selectedBusiness === 'new') && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                      <Building2 className="w-4 h-4 text-gold-600" />
                      <span>{t('business_claim.register_new')}</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">{t('business_claim.biz_name')}</label>
                      <input
                        type="text"
                        required
                        disabled={resultMessage?.type === 'success' || submitting}
                        value={newBizData.name}
                        onChange={(e) => setNewBizData({ ...newBizData, name: e.target.value })}
                        placeholder={t('business_claim.biz_name_placeholder')}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white disabled:bg-stone-100 disabled:text-stone-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">{t('business_claim.category_label')}</label>
                        <select
                          value={newBizData.category}
                          disabled={resultMessage?.type === 'success' || submitting}
                          onChange={(e) => setNewBizData({ ...newBizData, category: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white disabled:bg-stone-100 disabled:text-stone-500"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">{t('business_claim.whatsapp_label')}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          disabled={resultMessage?.type === 'success' || submitting}
                          value={newBizData.phone}
                          onChange={(e) => setNewBizData({ ...newBizData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                          placeholder={t('business_claim.whatsapp_placeholder')}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white disabled:bg-stone-100 disabled:text-stone-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resultMessage?.type === 'success' || submitting}
                  className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-royal-950 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>
                    {resultMessage?.type === 'success'
                      ? t('business_claim.success_btn')
                        : submitting
                          ? t('business_claim.submitting_btn')
                          : t('business_claim.submit_btn')}
                  </span>
                </button>

                {resultMessage?.type === 'success' && (
                  <button
                    type="button"
                    onClick={handleReturnToBusiness}
                    className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl text-center block transition-colors mt-2 cursor-pointer"
                  >
                    {t('business_claim.return_to_biz')}
                  </button>
                )}
              </>
            )}
          </form>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0d] flex items-center justify-center text-white text-xs">Loading claim form...</div>}>
      <ClaimFormContent />
    </Suspense>
  );
}
