import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-royal-950 text-gold-400 mb-3">
              <span className="font-manrope font-bold text-lg">Ψ</span>
            </div>
            <h2 className="font-manrope text-xl font-bold text-royal-950">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {mode === 'login'
                ? 'Sign in to access your saved destinations and trip plans'
                : 'Join Explore Jogja to bookmark and plan your trips'}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-royal-950 py-3 text-sm font-semibold text-gold-300 hover:bg-royal-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

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
