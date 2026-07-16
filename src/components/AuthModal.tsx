import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Check, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SocialLoginButtons from './SocialLoginButtons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { label: 'Number (0-9)', valid: /[0-9]/.test(password) },
    { label: 'Symbol (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(password) },
    { label: 'No spaces', valid: !password.includes(' ') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'register') {
      const result = await register(name, email, password);
      if (result.success) {
        setSuccess('Account created! You can now log in.');
        setMode('login');
        setPassword('');
      } else {
        setError(result.error || 'Registration failed');
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Login failed');
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl border border-gold-100 overflow-hidden">
        {/* Gold top accent */}
        <div className="h-1.5 bg-gradient-to-r from-gold-400 via-gold-600 to-gold-400" />

        <div className="p-8">
          {/* Close button */}
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-royal-950 mb-3">
              <img src="/logo-gold-new.png" alt="Jogjagem" className="h-6 w-auto" />
            </div>
            <h2 className="font-manrope text-xl font-bold text-royal-950">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {mode === 'login'
                ? 'Sign in to access your saved destinations and trip plans'
                : 'Join Jogjagem to bookmark and plan your trips'}
            </p>
          </div>

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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Full name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-royal-950 placeholder-stone-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-royal-950 placeholder-stone-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
              />
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-royal-950 placeholder-stone-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                />
              </div>

              {/* Password requirements - only show in register mode */}
              {mode === 'register' && password.length > 0 && (
                <div className="mt-2 p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Info className="h-3 w-3 text-stone-400" />
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Password requirements</span>
                  </div>
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center ${check.valid ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                        {check.valid && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className={`text-[11px] ${check.valid ? 'text-emerald-600 font-medium' : 'text-stone-500'}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-royal-950 py-3 text-sm font-semibold text-gold-300 hover:bg-royal-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-5">
            <SocialLoginButtons onError={setError} onSuccess={() => { onClose(); resetForm(); }} />
          </div>

          {/* Toggle */}
          <div className="mt-5 text-center">
            <button
              onClick={toggleMode}
              className="text-xs text-stone-500 hover:text-gold-700 transition-colors"
            >
              {mode === 'login' ? (
                <>Don't have an account? <span className="font-semibold text-gold-700">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-semibold text-gold-700">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
