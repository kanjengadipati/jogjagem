'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff, ClipboardList, Heart, Map, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useRouter } from '@/i18n/navigation';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'login' | 'register';
}

type ModalMode = 'login' | 'register' | 'forgot';

/** Tugu Jogja line-art illustration as inline SVG */
function TuguIllustration() {
  return (
    <svg viewBox="0 0 260 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Background circle */}
      <circle cx="130" cy="160" r="130" fill="#F5EDD6" fillOpacity="0.6" />

      {/* Ground / base platform */}
      <rect x="60" y="295" width="140" height="8" rx="4" fill="#C8A96E" fillOpacity="0.5" />

      {/* Outer wide plinth */}
      <rect x="80" y="268" width="100" height="30" rx="3" fill="none" stroke="#B8912A" strokeWidth="1.5" />
      <rect x="85" y="272" width="90" height="22" rx="2" fill="none" stroke="#C8A96E" strokeWidth="1" />

      {/* Steps */}
      <rect x="88" y="255" width="84" height="16" rx="2" fill="none" stroke="#B8912A" strokeWidth="1.5" />
      <rect x="96" y="244" width="68" height="14" rx="2" fill="none" stroke="#B8912A" strokeWidth="1.5" />
      <rect x="104" y="234" width="52" height="13" rx="2" fill="none" stroke="#C8A96E" strokeWidth="1" />

      {/* Main shaft lower */}
      <rect x="114" y="165" width="32" height="72" rx="2" fill="none" stroke="#B8912A" strokeWidth="1.5" />
      {/* Shaft detail lines */}
      <line x1="120" y1="170" x2="120" y2="232" stroke="#C8A96E" strokeWidth="0.8" />
      <line x1="140" y1="170" x2="140" y2="232" stroke="#C8A96E" strokeWidth="0.8" />

      {/* Middle band */}
      <rect x="110" y="158" width="40" height="12" rx="2" fill="none" stroke="#B8912A" strokeWidth="1.5" />

      {/* Main shaft upper */}
      <rect x="118" y="96" width="24" height="65" rx="2" fill="none" stroke="#B8912A" strokeWidth="1.5" />
      <line x1="124" y1="100" x2="124" y2="158" stroke="#C8A96E" strokeWidth="0.8" />
      <line x1="136" y1="100" x2="136" y2="158" stroke="#C8A96E" strokeWidth="0.8" />

      {/* Upper band */}
      <rect x="113" y="88" width="34" height="12" rx="2" fill="none" stroke="#B8912A" strokeWidth="1.5" />

      {/* Neck */}
      <rect x="122" y="68" width="16" height="23" rx="1" fill="none" stroke="#B8912A" strokeWidth="1.5" />

      {/* Capital / crown */}
      <path d="M112 68 Q130 54 148 68" stroke="#B8912A" strokeWidth="1.8" fill="none" />
      <path d="M115 68 L115 75 Q130 80 145 75 L145 68" stroke="#B8912A" strokeWidth="1.2" fill="#F5EDD6" fillOpacity="0.7" />

      {/* Spire */}
      <path d="M126 24 L130 8 L134 24" stroke="#B8912A" strokeWidth="1.5" fill="none" />
      <line x1="130" y1="8" x2="130" y2="55" stroke="#B8912A" strokeWidth="1.2" />

      {/* Ornamental tip flame/star */}
      <circle cx="130" cy="7" r="3.5" fill="none" stroke="#C8A96E" strokeWidth="1.2" />
      <circle cx="130" cy="7" r="1.5" fill="#B8912A" />

      {/* Decorative side elements - trees */}
      <path d="M74 260 Q74 235 80 220 Q88 205 82 195 Q76 185 84 178 Q92 170 88 162" stroke="#C8A96E" strokeWidth="1.2" fill="none" />
      <ellipse cx="76" cy="192" rx="16" ry="24" fill="none" stroke="#C8A96E" strokeWidth="1" />
      <ellipse cx="81" cy="172" rx="12" ry="18" fill="none" stroke="#C8A96E" strokeWidth="1" />

      <path d="M186 260 Q186 235 180 220 Q172 205 178 195 Q184 185 176 178 Q168 170 172 162" stroke="#C8A96E" strokeWidth="1.2" fill="none" />
      <ellipse cx="184" cy="192" rx="16" ry="24" fill="none" stroke="#C8A96E" strokeWidth="1" />
      <ellipse cx="179" cy="172" rx="12" ry="18" fill="none" stroke="#C8A96E" strokeWidth="1" />

      {/* Decorative horizontal lines at bottom suggesting path/road */}
      <line x1="40" y1="285" x2="220" y2="285" stroke="#C8A96E" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="30" y1="292" x2="230" y2="292" stroke="#C8A96E" strokeWidth="0.6" strokeOpacity="0.4" />
    </svg>
  );
}

export default function AuthModal({ isOpen, onClose, onSuccess, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<ModalMode>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register, forgotPassword } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) return;
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      sessionStorage.setItem('auth_return_to', window.location.pathname);
    }
    const redirectUri = window.location.origin;
    const nonce = Math.random().toString(36).substring(2);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&nonce=${nonce}&prompt=select_account`;
    window.location.href = googleAuthUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'forgot') {
      setLoading(true);
      const result = await forgotPassword(email);
      setLoading(false);
      if (result.success) {
        setSuccess(t('auth.reset_link_sent'));
      } else {
        setError(result.error || 'Failed to send reset email');
      }
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError(t('auth.password_mismatch'));
        return;
      }
    }

    setLoading(true);

    if (mode === 'register') {
      const result = await register(name, email, password);
      if (result.success) {
        const loginResult = await login(email, password);
        if (loginResult.success) {
          onClose();
          resetForm();
          if (onSuccess) {
            onSuccess();
          } else {
            const returnTo = sessionStorage.getItem('auth_return_to');
            if (returnTo) {
              sessionStorage.removeItem('auth_return_to');
              router.push(returnTo);
            }
          }
        } else {
          setSuccess(t('auth.account_created'));
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        setError(result.error || t('auth.register_failed'));
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        onClose();
        resetForm();
        if (onSuccess) {
          onSuccess();
        } else {
          const returnTo = sessionStorage.getItem('auth_return_to');
          if (returnTo) {
            sessionStorage.removeItem('auth_return_to');
            router.push(returnTo);
          } else {
            router.push('/profile');
          }
        }
      } else {
        setError(result.error || t('auth.login_failed'));
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAgreeTerms(false);
    setError('');
    setSuccess('');
  };

  const switchMode = (next: ModalMode) => {
    setMode(next);
    setError('');
    setSuccess('');
  };

  const features = [
    { icon: ClipboardList, label: t('auth.feature_plan') },
    { icon: Heart, label: t('auth.feature_save') },
    { icon: Map, label: t('auth.feature_recommend') },
  ];

  /* ─── Left panel subtitle text ─── */
  const leftTitle = mode === 'register'
    ? t('auth.create_account_at')
    : t('auth.welcome_at');
  const leftSubtitle = mode === 'register'
    ? t('auth.signup_subtitle')
    : t('auth.signin_subtitle');

  /* ─── Right panel title ─── */
  const rightTitle = mode === 'login'
    ? t('auth.welcome_back')
    : mode === 'register'
      ? t('auth.create_account')
      : t('auth.forgot_password_title');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { onClose(); resetForm(); }}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-2xl bg-[#F7F1E8] rounded-3xl shadow-2xl overflow-hidden flex">

        {/* ─────────────── LEFT PANEL ─────────────── */}
        <div className="hidden sm:flex flex-col w-[44%] min-h-full bg-gradient-to-b from-[#F5EDD6] to-[#EBE0C8] p-7 relative overflow-hidden shrink-0">
          {/* Subtle radial glow behind illustration */}
          <div className="absolute inset-0 flex items-start justify-center pt-4 pointer-events-none">
            <div className="w-56 h-56 rounded-full bg-[#D6A147] opacity-[0.12] blur-3xl" />
          </div>

          {/* Tugu Illustration */}
          <div className="relative z-10 w-full flex-1 flex items-start justify-center" style={{ maxHeight: 240 }}>
            <TuguIllustration />
          </div>

          {/* Logo + brand name */}
          <div className="relative z-10 flex items-center gap-3 mt-2 mb-3">
            <div className="h-10 w-10 rounded-full bg-[#0f100c] flex items-center justify-center shadow-lg shrink-0">
              <Image src="/logo-gold-new.png" alt="Jogjagem" width={22} height={22} className="h-[22px] w-auto" />
            </div>
          </div>

          {/* Title */}
          <div className="relative z-10 mb-2">
            <p className="font-manrope text-[#292a22] text-lg font-bold leading-tight">{leftTitle}</p>
            <p className="font-manrope text-[#B8912A] text-2xl font-extrabold leading-tight">Jogjagem</p>
          </div>

          {/* Subtitle */}
          <p className="relative z-10 text-[#4a4538] text-xs leading-relaxed mb-5">
            {leftSubtitle}
          </p>

          {/* Feature badges */}
          <div className="relative z-10 flex flex-wrap gap-2">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/60 border border-[#D6A147]/30 rounded-xl px-2.5 py-1.5 backdrop-blur-sm">
                <Icon className="h-3.5 w-3.5 text-[#B8912A] shrink-0" />
                <span className="text-[10px] font-medium text-[#3f4136] leading-none whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─────────────── RIGHT PANEL ─────────────── */}
        <div className="flex-1 p-7 overflow-y-auto max-h-[90vh]">
          {/* Close button */}
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Back button on forgot mode */}
          {mode === 'forgot' && (
            <button
              onClick={() => switchMode('login')}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#B8912A] transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('auth.back_to_login')}
            </button>
          )}

          {/* Title */}
          <h2 className="font-manrope text-[#0f100c] text-xl font-bold mb-5">
            {rightTitle}
          </h2>

          {/* Error / Success */}
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              {success}
            </div>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {mode === 'forgot' && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm text-stone-500 mb-4 leading-relaxed">
                {t('auth.forgot_password_desc')}
              </p>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder={t('auth.email_placeholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!success}
                  className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-[#0f100c] placeholder-stone-400 focus:outline-none focus:border-[#B8912A] focus:ring-2 focus:ring-[#B8912A]/20 transition-all disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full rounded-xl bg-[#0f100c] py-3 text-sm font-semibold text-[#D6A147] hover:bg-[#1b1c16] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-1"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{t('auth.send_reset_link')}</span>
              </button>
            </form>
          )}

          {/* ── LOGIN / REGISTER FORM ── */}
          {mode !== 'forgot' && (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full name - register only */}
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t('auth.full_name_placeholder')}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-[#0f100c] placeholder-stone-400 focus:outline-none focus:border-[#B8912A] focus:ring-2 focus:ring-[#B8912A]/20 transition-all"
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder={t('auth.email_placeholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-[#0f100c] placeholder-stone-400 focus:outline-none focus:border-[#B8912A] focus:ring-2 focus:ring-[#B8912A]/20 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password_placeholder')}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-11 text-sm text-[#0f100c] placeholder-stone-400 focus:outline-none focus:border-[#B8912A] focus:ring-2 focus:ring-[#B8912A]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>

                {/* Forgot password link - login only */}
                {mode === 'login' && (
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-[#B8912A] hover:text-[#96511a] transition-colors font-medium"
                    >
                      {t('auth.forgot_password')}
                    </button>
                  </div>
                )}
              </div>

              {/* Confirm password - register only */}
              {mode === 'register' && (
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.confirm_password_placeholder')}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-11 text-sm text-[#0f100c] placeholder-stone-400 focus:outline-none focus:border-[#B8912A] focus:ring-2 focus:ring-[#B8912A]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              )}

              {/* Terms checkbox - register only */}
              {mode === 'register' && (
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="sr-only"
                      required
                    />
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${agreeTerms ? 'bg-[#B8912A] border-[#B8912A]' : 'border-stone-300 bg-white group-hover:border-[#B8912A]'}`}>
                      {agreeTerms && (
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-stone-500 leading-relaxed">
                    {t('auth.agree_terms')}{' '}
                    <button type="button" className="text-[#B8912A] hover:underline font-medium">{t('auth.terms')}</button>
                    {' '}{t('auth.and')}{' '}
                    <button type="button" className="text-[#B8912A] hover:underline font-medium">{t('auth.privacy')}</button>
                  </span>
                </label>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (mode === 'register' && !agreeTerms)}
                className="w-full rounded-xl bg-[#0f100c] py-3 text-sm font-semibold text-[#D6A147] hover:bg-[#1b1c16] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-1"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{mode === 'login' ? t('auth.signin_btn') : t('auth.create_btn')}</span>
              </button>
            </form>
          )}

          {/* Social login & toggle — only on login/register */}
          {mode !== 'forgot' && (
            <>
              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs text-stone-400">{t('auth.or_continue_with')}</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Google */}
              {GOOGLE_CLIENT_ID && (
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 active:scale-[0.98] transition-all shadow-sm"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {mode === 'login' ? t('auth.signin_google') : t('auth.signup_google')}
                </button>
              )}

              {/* Toggle login/register */}
              <p className="mt-5 text-center text-xs text-stone-500">
                {mode === 'login' ? t('auth.no_account') : t('auth.has_account')}{' '}
                <button
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="font-semibold text-[#B8912A] hover:text-[#96511a] transition-colors"
                >
                  {mode === 'login' ? t('auth.signup_link') : t('auth.signin_link')}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
