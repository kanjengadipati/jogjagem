import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Heart, Bell, Menu, X, Brain, CalendarDays, Map, LogIn, LogOut, ShieldCheck, Settings, HelpCircle, Bookmark, ChevronRight, Home, Languages } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AuthModal from './AuthModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
  isOverHero?: boolean;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export default function Header({ activeTab, setActiveTab, savedCount, isOverHero = false, onOpenAuth: _onOpenAuth }: HeaderProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { id: 'discover', label: t('common.explore'), icon: Compass },
    { id: 'events', label: t('home.upcoming_festivals'), icon: CalendarDays },
    { id: 'planner', label: t('common.planner'), icon: CalendarDays },
    { id: 'ai-assistant', label: t('common.ai_assistant'), icon: Brain },
    { id: 'map', label: t('common.map'), icon: Map },
    { id: 'saved', label: t('common.saved'), icon: Bookmark },
  ];

  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const openLogin = () => { setAuthModalMode('login'); setAuthModalOpen(true); };
  const openRegister = () => { setAuthModalMode('register'); setAuthModalOpen(true); };
  const handleNav = (id: string) => { setActiveTab(id); setDrawerOpen(false); };

  const headerClass = isOverHero
    ? "absolute top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-gradient-to-b from-black/60 via-black/20 to-transparent border-transparent text-white"
    : "sticky top-0 z-50 w-full transition-all duration-300 bg-royal-950 border-b border-royal-900 text-white shadow-md";

  return (
    <>
      <header id="main-app-header" className={headerClass}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo */}
            <div 
            id="brand-logo-container" 
            className="flex cursor-pointer items-center group shrink-0"
            onClick={() => setActiveTab('discover')}
          >
            <div className="text-gold-400 transition-transform duration-300 group-hover:scale-105 mr-2">
              <Image src="/logo-gold-new.png" alt="Jogjagem Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-manrope text-[17px] font-bold tracking-widest text-white">Jogjagem</span>
              <span className="font-sans text-[8px] uppercase tracking-[0.08em] text-gold-300/90 font-semibold">{t('header.tagline')}</span>
            </div>
          </div>

          {/* Desktop Navigation — lg and above only */}
          <nav id="desktop-navbar" className="hidden lg:flex items-center whitespace-nowrap space-x-3 xl:space-x-8">
            {navItems.filter(item => item.id !== 'map' && (item.id !== 'saved' || isAuthenticated)).map((item) => {
              const isActive = activeTab === item.id || 
                (item.id === 'events' && activeTab === 'discover-events') || 
                (item.id === 'experiences' && activeTab === 'discover-experiences');
              
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    if (item.id === 'planner') { router.push('/planner'); }
                    else if (item.id === 'saved') { setDrawerOpen(false); router.push('/saved'); }
                    else if (item.id === 'ai-assistant') router.push('/ai');
                    else setActiveTab(item.id);
                  }}
                  className={`text-sm font-medium tracking-wide transition-all duration-300 border-b-2 py-1 ${
                    isActive 
                      ? 'border-gold-400 text-gold-300 font-semibold' 
                      : 'border-transparent text-white/80 hover:text-white hover:border-white/30'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            <button
              onClick={() => setActiveTab('map')}
              className={`text-sm font-medium tracking-wide transition-all duration-300 border-b-2 py-1 ${
                activeTab === 'map'
                  ? 'border-gold-400 text-gold-300 font-semibold'
                  : 'border-transparent text-white/80 hover:text-white hover:border-white/30'
              }`}
            >
              {t('common.map')}
            </button>
          </nav>

          {/* Desktop Action Icons — lg and above */}
          <div className="hidden lg:flex items-center space-x-2 shrink-0">
            <LanguageSwitcher />

            {isAuthenticated && (
              <button
                id="desktop-saved-icon-btn"
                onClick={() => router.push('/saved')}
                className="relative p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <Heart className={`h-5 w-5 ${savedCount > 0 ? 'fill-gold-400 text-gold-400 animate-pulse' : ''}`} />
                {savedCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[8px] font-bold text-white">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setBellOpen(!bellOpen)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold-400" />
                </button>

                {bellOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-royal-950">{t('common.notifications')}</span>
                        <button onClick={() => setBellOpen(false)} className="text-xs text-stone-400 hover:text-stone-600">
                          {t('common.mark_read')}
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {[
                          { title: t('header.notification_festival_title'), desc: t('header.notification_festival_desc'), time: t('header.notification_festival_time'), unread: true },
                          { title: t('header.notification_ai_title'), desc: t('header.notification_ai_desc'), time: t('header.notification_ai_time'), unread: true },
                          { title: t('header.notification_trip_title'), desc: t('header.notification_trip_desc'), time: t('header.notification_trip_time'), unread: false },
                        ].map((n, i) => (
                          <div key={i} className={`px-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer ${n.unread ? 'bg-gold-50/50' : ''}`}>
                            <div className="flex items-start gap-2.5">
                              {n.unread && <span className="mt-1.5 h-2 w-2 rounded-full bg-gold-500 shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-royal-950 leading-tight">{n.title}</p>
                                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{n.desc}</p>
                                <p className="text-[10px] text-stone-400 mt-1">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <a
                    href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3005'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-gold-400 hover:text-gold-300"
                    title={t('common.admin_panel')}
                  >
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </a>
                )}
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || t('common.user'))}`}
                    className="h-5 w-5 rounded-full bg-stone-200"
                    alt={user?.name || t('common.user')}
                  />
                  <span className="text-xs font-medium text-white/90 max-w-[100px] truncate">
                    {user?.name || t('common.user')}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                  title={t('common.logout')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={openLogin}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors text-xs font-medium"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{t('common.sign_in')}</span>
                </button>
                <button
                  onClick={openRegister}
                  className="px-3 py-1.5 rounded-full bg-gold-600 text-white hover:bg-gold-500 transition-colors text-xs font-semibold"
                >
                  {t('common.sign_up')}
                </button>
              </div>
            )}

          </div>

          {/* Mobile/tablet top action menu — below lg */}
          <div className="flex lg:hidden items-center space-x-3">
            {isAuthenticated && (
              <button
                onClick={() => router.push('/saved')}
                className="relative p-2 rounded-full text-white hover:bg-white/10"
              >
                <Heart className={`h-5 w-5 ${savedCount > 0 ? 'fill-gold-400 text-gold-400' : ''}`} />
                {savedCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[8px] font-bold text-white">
                    {savedCount}
                  </span>
                )}
              </button>
            )}
            
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="p-2 rounded-full text-white/70 hover:bg-white/10"
              >
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={openLogin}
                className="p-2 rounded-full text-gold-400 hover:bg-white/10"
              >
                <LogIn className="h-5 w-5" />
              </button>
            )}

            <button
              id="mobile-menu-toggle"
              onClick={() => setDrawerOpen(true)}
              className="rounded-full p-2 text-white hover:bg-white/10 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Side Drawer Backdrop ── */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* ── Side Drawer Panel ── */}
      <div className={`lg:hidden fixed top-0 left-0 z-[70] h-full w-[300px] bg-royal-950 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('discover')}>
            <Image src="/logo-gold-new.png" alt="Jogjagem Logo" width={34} height={34} className="object-contain" />
            <div>
              <span className="block font-manrope text-[15px] font-bold tracking-widest text-white">Jogjagem</span>
              <span className="block font-sans text-[8px] uppercase tracking-widest text-gold-300/80">{t('header.tagline')}</span>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.filter(item => item.id !== 'saved' || isAuthenticated).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id ||
              (item.id === 'events' && activeTab === 'discover-events') ||
              (item.id === 'experiences' && activeTab === 'discover-experiences');
            return (
              <button
                key={item.id}
                onClick={() => {
                    if (item.id === 'planner') { setDrawerOpen(false); router.push('/planner'); }
                    else if (item.id === 'saved') { setDrawerOpen(false); router.push('/saved'); }
                    else if (item.id === 'ai-assistant') { setDrawerOpen(false); router.push('/ai'); }
                    else handleNav(item.id);
                  }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive ? 'bg-gold-700/30 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-gold-500/20 text-gold-400' : 'bg-white/5 text-white/50 group-hover:text-white/80'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-white font-semibold' : ''}`}>{item.label}</span>
                </div>
                <ChevronRight className={`h-4 w-4 ${isActive ? 'text-gold-400 opacity-80' : 'opacity-30'}`} />
              </button>
            );
          })}
        </nav>

        {/* Profile section */}
        <div className="px-3 pb-2 border-t border-white/10 pt-3">
          {isAuthenticated ? (
            <button onClick={() => { router.push('/profile'); setDrawerOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || t('common.user'))}`}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-gold-500/30"
                  alt={user?.name || t('common.user')}
                />
                <div className="text-left">
                  <span className="block text-sm font-semibold text-white truncate max-w-[150px]">{user?.name || t('common.user')}</span>
                  <span className="block text-[10px] text-gold-400 font-medium">{t('common.level_1_explorer')}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/30" />
            </button>
          ) : (
            <div className="space-y-2 px-1 py-2">
              <button onClick={() => { openLogin(); setDrawerOpen(false); }} className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors">
                <LogIn className="h-4 w-4" /><span>{t('common.sign_in')}</span>
              </button>
              <button onClick={() => { openRegister(); setDrawerOpen(false); }} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-500 transition-colors">
                {t('common.sign_up')}
              </button>
            </div>
          )}
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'superadmin') && (
            <a href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3005'} target="_blank" rel="noopener noreferrer"
              onClick={() => setDrawerOpen(false)}
              className="mt-1 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-gold-700/20 to-gold-600/10 hover:from-gold-700/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gold-500/20 text-gold-400"><ShieldCheck className="h-4 w-4" /></div>
                <span className="text-sm font-semibold text-gold-400">{t('common.business_partner')}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gold-400/50" />
            </a>
          )}
        </div>

        {/* Footer links */}
        <div className="px-3 pb-8 pt-1 border-t border-white/10 flex items-center gap-1">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors text-xs font-medium">
            <Settings className="h-4 w-4" /><span>{t('common.settings')}</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors text-xs font-medium">
            <HelpCircle className="h-4 w-4" /><span>{t('common.help')}</span>
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
}
