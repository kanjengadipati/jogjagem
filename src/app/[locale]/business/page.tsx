'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { businesses, listingClaims, BeBusiness, BeListingClaim } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Megaphone,
  BarChart2,
  Building2,
  Plus,
  Store,
  FileCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { PLACEMENT_NAMES } from '@/lib/adPlacements';

const CATEGORIES = ['Kuliner', 'Hotel & Penginapan', 'Wisata & Destinasi', 'Oleh-oleh', 'Jasa', 'Lainnya'];
const REGIONS = ['Kota Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunungkidul', 'Near Yogyakarta'] as const;

function BusinessLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useLocale();
  return (
    <div className="min-h-screen md:h-screen flex items-center justify-center p-0 md:p-6 relative overflow-hidden bg-stone-950">
      <Image src="/merapi.png" alt="Gunung Merapi" fill priority className="object-cover object-center" />
      <div className="absolute inset-0 bg-black/45" />
      <button
        onClick={() => router.push('/')}
        className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/55 backdrop-blur-md border border-white/25 text-white text-xs font-semibold hover:bg-black/75 hover:border-white/40 transition-all shadow-lg"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('business_page.back_to_home')}</span>
      </button>
      {/* Card: full viewport height on desktop */}
      <div className="relative z-10 w-full max-w-[960px] md:h-[calc(100vh-3rem)] rounded-none md:rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,.65)] flex flex-col md:flex-row">
        {children}
      </div>
    </div>
  );
}

function VisualPanel() {
  const { t } = useLocale();
  return (
    <div className="relative md:w-[48%] min-h-[340px] md:min-h-[520px] overflow-hidden text-white flex flex-col justify-between p-8">
      <Image src="/merapi.png" alt="Gunung Merapi" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/40" />

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

      <div className="relative z-10 space-y-4">
        {[
          { Icon: Shield,   title: t('business_page.feature_claim_title'), desc: t('business_page.feature_claim_desc') },
          { Icon: Megaphone, title: t('business_page.feature_promo_title'), desc: t('business_page.feature_promo_desc') },
          { Icon: BarChart2, title: t('business_page.feature_rep_title'),  desc: t('business_page.feature_rep_desc') },
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

function extractDataArray<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

export default function BusinessPage() {
  const { user, isAuthenticated } = useAuth();
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const placement = searchParams.get('placement');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [myBusinesses, setMyBusinesses] = useState<BeBusiness[]>([]);
  const [myClaims, setMyClaims] = useState<BeListingClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(action === 'register' || Boolean(placement));

  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    description: '',
    phone: '',
    address: '',
    regions: [] as string[],
    email: '',
    website: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  type SubmitStep = 'idle' | 'checking-name' | 'checking-email' | 'saving' | 'done';
  const [submitStep, setSubmitStep] = useState<SubmitStep>('idle');
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  useEffect(() => {
    if (action === 'register' || placement) {
      setShowCreateForm(true);
    }
  }, [action, placement]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBusinesses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const [bizRes, claimRes] = await Promise.allSettled([
        businesses.getMine(),
        listingClaims.getMine()
      ]);

      if (bizRes.status === 'fulfilled') {
        setMyBusinesses(extractDataArray<BeBusiness>(bizRes.value));
      }
      if (claimRes.status === 'fulfilled') {
        setMyClaims(extractDataArray<BeListingClaim>(claimRes.value));
      }
    } catch {
      setMyBusinesses([]);
      setMyClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) return false; // wajib
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 15) return false;
    return /^(\+62|62|0)[8][1-9][0-9]{6,11}$/.test(cleanPhone);
  };

  const validateEmail = (email: string): boolean => {
    const trimmed = email.trim();
    if (!trimmed) return true; // opsional, kosong = valid
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const checkEmailDomainValid = async (email: string): Promise<boolean> => {
    const domain = email.split('@')[1];
    if (!domain) return false;
    try {
      const res = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
        { signal: AbortSignal.timeout(2500) }
      );
      if (!res.ok) return true; // gagal cek → fail-open
      const data = await res.json();
      return Array.isArray(data.Answer) && data.Answer.length > 0;
    } catch {
      return true; // timeout/network error → fail-open, jangan blokir user
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!validatePhone(formData.phone)) {
      setMessage({ type: 'error', text: t('business_page.err_phone') });
      return;
    }
    if (!formData.address.trim()) {
      setMessage({ type: 'error', text: t('business_page.err_address') });
      return;
    }
    if (formData.regions.length === 0) {
      setMessage({ type: 'error', text: t('business_page.err_regions') });
      return;
    }
    if (formData.email.trim() && !validateEmail(formData.email)) {
      setMessage({ type: 'error', text: t('business_page.err_email_format') });
      return;
    }

    setSubmitting(true);
    setSubmitStep('checking-name');
    setMessage(null);
    setEmailWarning(null);

    // Step 1: cek nama duplikat — global check via API (fail-open)
    try {
      const checkRes = await fetch(`/api/businesses/check-name?q=${encodeURIComponent(formData.name.trim())}`);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        const similar: Array<{ name: string }> = checkData?.data ?? [];
        const exactMatch = similar.find(
          (b) => b.name?.trim().toLowerCase() === formData.name.trim().toLowerCase()
        );
        if (exactMatch) {
          setMessage({
            type: 'error',
            text: t('business_page.err_name_taken', { name: exactMatch.name }),
          });
          setSubmitting(false);
          setSubmitStep('idle');
          return;
        }
      }
    } catch {
      // fail-open: kalau endpoint tidak bisa dijangkau, lanjut saja
    }

    // Step 2: cek domain email (real DNS-over-HTTPS call)
    setSubmitStep('checking-email');
    if (formData.email.trim()) {
      const validDomain = await checkEmailDomainValid(formData.email.trim());
      if (!validDomain) {
        setEmailWarning(t('business_page.email_warning'));
      }
    }

    // Step 3: simpan ke server
    setSubmitStep('saving');
    try {
      const res = await businesses.create(formData);
      const createdBiz = (res as any)?.data || res;
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
      const bizId = createdBiz?.external_id || createdBiz?.id || '';

      setSubmitStep('done');
      setMessage({
        type: 'success',
        text: t('business_page.success_registered'),
      });
      setFormData({ name: '', category: CATEGORIES[0], description: '', phone: '', address: '', regions: [], email: '', website: '' });
      setShowCreateForm(false);

      setTimeout(() => {
        const targetUrl = `${adminUrl}/business/${bizId}/dashboard${placement ? `?placement=${encodeURIComponent(placement)}` : ''}`;
        window.location.href = targetUrl;
      }, 1000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || t('business_page.err_submit') });
    } finally {
      setSubmitting(false);
      setSubmitStep('idle');
    }
  };

  const placementName = placement ? (PLACEMENT_NAMES[placement] || placement) : '';

  return (
    <BusinessLayout>
      <VisualPanel />
      
      {/* Right panel — cream bg, scrollable internally */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF6EF]">
        <div className="flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6 flex flex-col justify-center">
        {!isAuthenticated ? (
          <div className="text-center space-y-5 py-6">
            {placementName && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 text-xs flex items-start gap-2.5 text-left mb-2 shadow-2xs">
                <Megaphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950">{t('business_page.ad_slot_label', { name: placementName })}</span>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    {t('business_page.ad_slot_auth_desc')}
                  </p>
                </div>
              </div>
            )}

            <div className="w-24 h-24 mx-auto opacity-60">
              <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="18" y="42" width="60" height="42" rx="4" fill="#D4A853" fillOpacity=".25" stroke="#D4A853" strokeWidth="2"/>
                <rect x="30" y="58" width="16" height="26" rx="2" fill="#D4A853" fillOpacity=".4"/>
                <rect x="50" y="64" width="14" height="20" rx="2" fill="#D4A853" fillOpacity=".4"/>
                <path d="M14 46 L48 24 L82 46" stroke="#D4A853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="62" cy="28" r="10" fill="#D4A853" fillOpacity=".2" stroke="#D4A853" strokeWidth="2"/>
                <circle cx="62" cy="28" r="4" fill="#D4A853"/>
                <line x1="62" y1="18" x2="62" y2="12" stroke="#D4A853" strokeWidth="2" strokeLinecap="round"/>
                <text x="70" y="22" fontSize="7" fill="#D4A853" opacity=".5">✦</text>
                <text x="30" y="38" fontSize="5" fill="#D4A853" opacity=".4">✦</text>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              {placementName
                ? t('business_page.login_required_ad_title', { name: placementName })
                : t('business_page.login_required_title')}
            </h2>
            <p className="text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
              {placementName
                ? t('business_page.login_required_ad_desc', { name: placementName })
                : t('business_page.login_required_desc')}
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white font-semibold text-sm rounded-full transition-all"
            >
              <Store className="w-4 h-4" />
              {placementName ? t('business_page.cta_login_ad') : t('business_page.cta_login')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> {t('business_page.secure_note')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {placementName && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 text-xs flex items-start gap-2.5 shadow-2xs">
                <Megaphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950">{t('business_page.ad_slot_selected_label', { name: placementName })}</span>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    {t('business_page.ad_slot_selected_desc')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {placementName ? t('business_page.ad_register_title') : t('business_page.my_businesses_title')}
                </h2>
                <p className="text-xs text-stone-500">
                  {placementName
                    ? t('business_page.ad_register_subtitle', { name: placementName })
                    : t('business_page.my_businesses_subtitle')}
                </p>
              </div>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-full transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('business_page.add_business_btn')}</span>
                </button>
              )}
            </div>

            {message && (
              <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}
            {emailWarning && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                ⚠️ {emailWarning}
              </div>
            )}

            {showCreateForm ? (
              <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <h3 className="text-sm font-bold text-stone-800 truncate">
                    {placementName
                      ? t('business_page.form_title_ad', { name: placementName })
                      : t('business_page.form_title')}
                  </h3>
                  {placementName && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200 shrink-0 whitespace-nowrap">
                      {t('business_page.form_step')}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_name')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={t('business_page.field_name_placeholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_category')}</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_phone')}</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        const clean = val.startsWith('+')
                          ? '+' + val.slice(1).replace(/\D/g, '')
                          : val.replace(/\D/g, '');
                        setFormData({ ...formData, phone: clean });
                      }}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      placeholder={t('business_page.field_phone_placeholder')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_regions')}</label>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map((region) => {
                      const checked = formData.regions.includes(region);
                      return (
                        <button
                          key={region}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              regions: checked
                                ? formData.regions.filter((r) => r !== region)
                                : [...formData.regions, region],
                            })
                          }
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                            checked
                              ? 'bg-amber-500 border-amber-500 text-white font-bold'
                              : 'bg-white border-stone-300 text-stone-600 hover:border-amber-400'
                          }`}
                        >
                          {region}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">{t('business_page.field_regions_hint')}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_address')}</label>
                  <textarea
                    rows={1}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder={t('business_page.field_address_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_description')}</label>
                  <textarea
                    rows={1}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder={t('business_page.field_description_placeholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_email')}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={t('business_page.field_email_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_website')}</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={t('business_page.field_website_placeholder')}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    {t('business_page.btn_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                  >
                    {submitting
                      ? ({
                          'checking-name':  t('business_page.step_checking_name'),
                          'checking-email': t('business_page.step_checking_email'),
                          'saving':         t('business_page.step_saving'),
                          'done':           t('business_page.step_done'),
                          'idle':           t('business_page.step_saving_fallback'),
                        } as const)[submitStep]
                      : (placementName ? t('business_page.btn_submit_ad') : t('business_page.btn_submit'))}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-10 text-xs text-stone-400">{t('business_page.loading')}</div>
                ) : myBusinesses.length === 0 ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-28 h-28 mx-auto opacity-70">
                      <svg viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="56" cy="96" rx="32" ry="6" fill="#E5C98A" fillOpacity=".3"/>
                        <rect x="22" y="50" width="68" height="46" rx="5" fill="#F5E6C8" stroke="#D4A853" strokeWidth="2"/>
                        <path d="M16 52 L56 24 L96 52" stroke="#C8912A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#E5C070" fillOpacity=".6"/>
                        <rect x="42" y="68" width="18" height="28" rx="3" fill="#C8912A" fillOpacity=".5" stroke="#C8912A" strokeWidth="1.5"/>
                        <rect x="26" y="60" width="16" height="14" rx="2" fill="#fff" fillOpacity=".7" stroke="#D4A853" strokeWidth="1.5"/>
                        <rect x="70" y="60" width="16" height="14" rx="2" fill="#fff" fillOpacity=".7" stroke="#D4A853" strokeWidth="1.5"/>
                        <circle cx="80" cy="30" r="13" fill="#E5A84B" stroke="#C8912A" strokeWidth="2"/>
                        <circle cx="80" cy="28" r="5" fill="#fff"/>
                        <path d="M80 33 L80 44" stroke="#C8912A" strokeWidth="2" strokeLinecap="round"/>
                        <text x="10" y="38" fontSize="10" fill="#D4A853" opacity=".5">✦</text>
                        <text x="88" y="58" fontSize="7" fill="#D4A853" opacity=".4">✦</text>
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-bold text-stone-800">{t('business_page.empty_title')}</p>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed max-w-[220px] mx-auto">
                        {t('business_page.empty_desc')}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white font-semibold text-xs rounded-full transition-all"
                    >
                      <Building2 className="w-4 h-4" />
                      {t('business_page.add_first_btn')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1 mt-1">
                      <Lock className="w-3 h-3" /> {t('business_page.secure_note')}
                    </p>
                  </div>
                ) : (
                  myBusinesses.map((biz) => (
                    <div key={biz.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/80 transition-colors flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-stone-900">{biz.name}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            biz.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            biz.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {biz.status === 'approved'
                              ? t('business_page.status_verified')
                              : biz.status === 'pending'
                              ? t('business_page.status_pending')
                              : biz.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">{biz.category} {biz.phone ? `• ${biz.phone}` : ''}</p>
                        {biz.status === 'pending' && (
                          <p className="text-[11px] text-amber-700 font-medium pt-0.5">
                            {t('business_page.status_pending_note')}
                          </p>
                        )}
                      </div>
                      <a
                        href={`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}/business/${biz.external_id || (biz as any).id || ''}/dashboard${placement ? `?placement=${encodeURIComponent(placement)}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-xs ${
                          placement ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold' : 'bg-stone-900 hover:bg-black text-white'
                        }`}
                      >
                        <span>{placement ? t('business_page.go_place_ad') : t('business_page.go_dashboard')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))
                )}

                {myClaims.length > 0 && (
                  <div className="pt-4 border-t border-stone-200 space-y-2">
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-gold-600" />
                      <span>{t('business_page.claims_title')}</span>
                    </h3>
                    <div className="space-y-2">
                      {myClaims.map((claim) => (
                        <div key={claim.id} className="p-3 bg-gold-50/50 border border-gold-200/60 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-stone-900 capitalize">{claim.listing_type}</span>
                            <span className="text-stone-500 font-mono ml-1 text-[11px]">({claim.listing_external_id})</span>
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              {t('business_page.claim_submitted')} {claim.submitted_at
                                ? new Date(claim.submitted_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID')
                                : t('business_page.claim_just_now')}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            claim.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            claim.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {claim.status === 'approved'
                              ? t('business_page.claim_status_approved')
                              : claim.status === 'rejected'
                              ? t('business_page.claim_status_rejected')
                              : t('business_page.claim_status_pending')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </div>{/* end overflow-y-auto */}
      </div>{/* end right panel */}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </BusinessLayout>
  );
}
