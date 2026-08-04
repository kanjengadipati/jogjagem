'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { businesses, listingClaims, BeBusiness, SearchResult } from '@/lib/api';
import Image from 'next/image';
import {
  Briefcase, CheckCircle2, Shield, AlertCircle, ArrowLeft,
  Building2, Search, Loader2, Megaphone, BarChart2,
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useLocale } from '@/contexts/LocaleContext';

const CATEGORIES = ['Kuliner', 'Hotel & Penginapan', 'Wisata & Destinasi', 'Oleh-oleh', 'Jasa', 'Lainnya'];

function friendlyClaimError(raw: string): string {
  const s = (raw || '').toLowerCase();
  if (s.includes('not an owner') || s.includes('forbidden') || s.includes('bukan pemilik'))
    return 'Anda bukan pemilik bisnis yang dipilih. Silakan pilih bisnis yang benar.';
  if (s.includes('already claimed') || s.includes('already owned') || s.includes('conflict'))
    return 'Listing ini sudah diklaim oleh bisnis lain.';
  if (s.includes('already pending') || s.includes('sudah ada klaim'))
    return 'Listing ini sudah memiliki klaim aktif yang sedang ditinjau.';
  if (s.includes('invalid listing type') || s.includes('unsupported listing'))
    return 'Jenis listing tidak didukung untuk klaim kepemilikan.';
  if (s.includes('not found') || s.includes('tidak ditemukan'))
    return 'Listing tidak ditemukan. Periksa kembali ID listing yang dimasukkan.';
  if (s.includes('permission') || s.includes('unauthorized') || s.includes('unauthenticated'))
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  if (s.includes('validation') || s.includes('required'))
    return 'Data yang dimasukkan tidak lengkap atau tidak valid.';
  return 'Gagal mengirim klaim. Silakan coba beberapa saat lagi.';
}

function extractDataArray<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
}

function validatePhone(phone: string): boolean {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return true;
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  if (digitsOnly.length < 9 || digitsOnly.length > 15) return false;
  return /^(\+62|62|0)[8][1-9][0-9]{6,11}$/.test(cleanPhone);
}

// ─── Visual Panel (sama persis dengan business/page.tsx) ───────────────────

function VisualPanel() {
  const { t } = useLocale();
  return (
    <div className="relative md:w-[48%] min-h-[220px] md:min-h-0 overflow-hidden text-white flex flex-col justify-between p-8">
      <Image src="/merapi.png" alt="Gunung Merapi" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/40" />

      {/* Top */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs font-semibold">
          <Image src="/logo-gold-new.png" alt="Jogjagem" width={16} height={16} className="object-contain" />
          <span>{t('business_page.platform_label')}</span>
        </div>
        <h1 className="mt-5 text-3xl md:text-[2.2rem] font-extrabold tracking-tight text-white leading-[1.15]">
          {t('business_page.visual_headline').split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}{' '}
          <span className="text-amber-400">{t('business_page.visual_headline_accent')}</span>
          <span className="text-amber-400 ml-1">✦</span>
        </h1>
        <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-xs">
          {t('business_page.visual_body')}
        </p>
      </div>

      {/* Bottom */}
      <div className="relative z-10 space-y-4">
        {[
          { Icon: Shield,    title: t('business_page.feature_claim_title'), desc: t('business_page.feature_claim_desc') },
          { Icon: Megaphone, title: t('business_page.feature_promo_title'), desc: t('business_page.feature_promo_desc') },
          { Icon: BarChart2, title: t('business_page.feature_rep_title'),   desc: t('business_page.feature_rep_desc') },
        ].map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{title}</div>
              <div className="text-xs text-white/60">{desc}</div>
            </div>
          </div>
        ))}
        <p className="text-amber-400 italic font-semibold text-sm pt-2" style={{ fontFamily: 'Georgia, serif' }}>
          {t('business_page.tagline')}
        </p>
      </div>
    </div>
  );
}

// ─── Main claim form ────────────────────────────────────────────────────────

function ClaimFormContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawType = searchParams.get('type') || 'destination';
  const listingType = rawType === 'culinary' ? 'restaurant'
    : rawType === 'shopping' ? 'souvenir'
    : rawType === 'accommodation' ? 'hotel'
    : rawType === 'attraction' ? 'destination'
    : rawType;
  const listingId   = searchParams.get('listingId') || '';
  const listingName = searchParams.get('name') || '';

  const [manualListingId, setManualListingId]   = useState('');
  const [selectedListingId, setSelectedListingId] = useState('');
  const [searchResults, setSearchResults]       = useState<SearchResult[]>([]);
  const [searching, setSearching]               = useState(false);
  const [showResults, setShowResults]           = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const targetListingId = listingId || selectedListingId || manualListingId;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setSelectedListingId('');
    const search = async () => {
      if (manualListingId.length < 3) { setSearchResults([]); return; }
      setSearching(true);
      try {
        const res = await listingClaims.search(manualListingId);
        setSearchResults(res.data ?? []);
        setShowResults(true);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    };
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [manualListingId]);

  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal]   = useState(false);
  const [myBusinesses, setMyBusinesses]     = useState<BeBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BeBusiness | 'new'>('new');
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [resultMessage, setResultMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newBizData, setNewBizData] = useState({
    name: '',
    category: listingType === 'hotel' ? 'Hotel & Penginapan'
      : listingType === 'restaurant' ? 'Kuliner'
      : listingType === 'souvenir' ? 'Oleh-oleh'
      : 'Wisata & Destinasi',
    phone: '',
    description: '',
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
      setSelectedBusiness(list.length > 0 ? list[0] : 'new');
    } catch {
      setMyBusinesses([]);
      setSelectedBusiness('new');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) { setShowAuthModal(true); return; }

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
          setResultMessage({ type: 'error', text: 'Nomor telepon tidak valid.' });
          setSubmitting(false);
          return;
        }
        const bizRes = await businesses.create(newBizData);
        if (bizRes.status === 'error') throw new Error(bizRes.message || 'Gagal mendaftarkan bisnis baru.');
        const rawBiz = (bizRes as any)?.data ?? (bizRes as any);
        targetBusinessExternalId = String(rawBiz?.external_id ?? rawBiz?.data?.external_id ?? '');
      } else {
        const biz = selectedBusiness as any;
        targetBusinessExternalId = String(biz?.external_id ?? biz?.data?.external_id ?? '');
      }

      if (!targetBusinessExternalId) throw new Error('Gagal mendapatkan identitas bisnis. Silakan refresh dan coba lagi.');
      if (!targetListingId.trim()) {
        setResultMessage({ type: 'error', text: 'Silakan isi ID / Nama listing yang hendak diklaim.' });
        setSubmitting(false);
        return;
      }

      const claimRes = await listingClaims.submit({
        business_external_id: targetBusinessExternalId,
        listing_type: listingType,
        listing_external_id: targetListingId,
      });
      if (claimRes.status === 'error') throw new Error(friendlyClaimError(claimRes.message || ''));

      setResultMessage({
        type: 'success',
        text: 'Klaim kepemilikan berhasil dikirim! Tim Jogjagem akan meninjau klaim Anda dalam 1×24 jam.',
      });
    } catch (err) {
      setResultMessage({ type: 'error', text: friendlyClaimError(err instanceof Error ? err.message : '') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen flex items-center justify-center p-0 md:p-6 relative overflow-hidden bg-stone-950">
      {/* Bg image */}
      <Image src="/merapi.png" alt="Gunung Merapi" fill priority className="object-cover object-center" />
      <div className="absolute inset-0 bg-black/45" />

      {/* Back button */}
      <button
        onClick={() => router.push('/business')}
        className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/55 backdrop-blur-md border border-white/25 text-white text-xs font-semibold hover:bg-black/75 hover:border-white/40 transition-all shadow-lg"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('business_page.back_to_home')}</span>
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[960px] md:h-[calc(100vh-3rem)] rounded-none md:rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,.65)] flex flex-col md:flex-row">
        <VisualPanel />

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF6EF]">
          <div className="flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6 flex flex-col justify-center">

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-stone-900">{t('business_claim.title')}</h2>
              <p className="text-xs text-stone-500 mt-0.5">{t('business_claim.subtitle')}</p>
            </div>

            {/* Target listing info */}
            <div className="p-3.5 bg-amber-50 border border-amber-200/70 rounded-2xl flex items-start gap-3 text-xs text-amber-900 mb-4">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="w-full">
                <span className="font-bold text-[11px] text-amber-700 uppercase tracking-wider block">
                  {t('business_claim.target_listing')}
                </span>
                {listingName || listingId ? (
                  <>
                    <span className="font-bold text-stone-900 text-sm block mt-0.5">{listingName || listingId}</span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      {t('business_claim.category')} <span className="capitalize font-medium">{listingType}</span>
                    </span>
                  </>
                ) : (
                  <div className="mt-1.5 space-y-1.5 relative" ref={searchRef}>
                    <span className="text-xs text-stone-600 block font-medium">{t('business_claim.search_prompt')}</span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t('business_claim.search_placeholder')}
                        value={manualListingId}
                        onChange={(e) => setManualListingId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 absolute right-2.5 top-2.5" />}
                    </div>
                    {showResults && searchResults.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border border-stone-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {searchResults.map((r) => (
                          <li
                            key={`${r.listing_type}:${r.id}`}
                            className="px-3 py-2 text-xs hover:bg-stone-50 cursor-pointer border-b last:border-0 border-stone-100"
                            onClick={() => { setManualListingId(r.name); setSelectedListingId(r.id); setShowResults(false); }}
                          >
                            <div className="font-semibold text-stone-900">{r.name}</div>
                            <div className="text-[10px] text-stone-400 capitalize">{r.listing_type}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Result message */}
            {resultMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 mb-4 ${
                resultMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {resultMessage.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div className="leading-relaxed">{resultMessage.text}</div>
              </div>
            )}

            {/* Auth gate */}
            {!isAuthenticated ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-stone-600">{t('business_claim.must_login')}</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-2.5 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors"
                >
                  {t('business_claim.login_btn')}
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8 text-stone-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Memuat data bisnis Anda...</span>
              </div>
            ) : (
              <form onSubmit={handleClaim} className="space-y-3">
                {/* Business selector */}
                {myBusinesses.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_claim.choose_business')}</label>
                    <select
                      value={selectedBusiness === 'new' ? 'new' : String((selectedBusiness as any).id || (selectedBusiness as any).ID || '')}
                      disabled={resultMessage?.type === 'success' || submitting}
                      onChange={(e) => {
                        if (e.target.value === 'new') { setSelectedBusiness('new'); return; }
                        const found = myBusinesses.find(b => String((b as any).id || (b as any).ID) === e.target.value);
                        if (found) setSelectedBusiness(found);
                      }}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-stone-100"
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

                {/* Inline new business form */}
                {(myBusinesses.length === 0 || selectedBusiness === 'new') && (
                  <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 pb-2 border-b border-stone-100">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span>{t('business_claim.register_new')}</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">{t('business_claim.biz_name')} *</label>
                      <input
                        type="text"
                        required
                        disabled={resultMessage?.type === 'success' || submitting}
                        value={newBizData.name}
                        onChange={(e) => setNewBizData({ ...newBizData, name: e.target.value })}
                        placeholder={t('business_claim.biz_name_placeholder')}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-stone-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">{t('business_claim.category_label')}</label>
                        <select
                          value={newBizData.category}
                          disabled={resultMessage?.type === 'success' || submitting}
                          onChange={(e) => setNewBizData({ ...newBizData, category: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-stone-100"
                        >
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">{t('business_claim.whatsapp_label')}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          disabled={resultMessage?.type === 'success' || submitting}
                          value={newBizData.phone}
                          onChange={(e) => setNewBizData({ ...newBizData, phone: e.target.value.replace(/[^0-9+]/g, '') })}
                          placeholder={t('business_claim.whatsapp_placeholder')}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono disabled:bg-stone-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={resultMessage?.type === 'success' || submitting}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('business_claim.submitting_btn')}</>
                    : resultMessage?.type === 'success'
                    ? <><CheckCircle2 className="w-3.5 h-3.5" /> {t('business_claim.success_btn')}</>
                    : <><Briefcase className="w-3.5 h-3.5" /> {t('business_claim.submit_btn')}</>}
                </button>

                {resultMessage?.type === 'success' && (
                  <button
                    type="button"
                    onClick={() => router.push('/business')}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    {t('business_claim.return_to_biz')}
                  </button>
                )}
              </form>
            )}

          </div>{/* end overflow-y-auto */}
        </div>{/* end right panel */}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white text-xs">
        Loading...
      </div>
    }>
      <ClaimFormContent />
    </Suspense>
  );
}
