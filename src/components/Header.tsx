import React, { useState } from 'react';
import { Compass, Heart, Bell, Menu, X, Brain, CalendarDays, Map, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
  isOverHero?: boolean;
}

export default function Header({ activeTab, setActiveTab, savedCount, isOverHero = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { id: 'discover', label: 'Explore', icon: Compass },
    { id: 'events', label: 'Events', icon: Compass },
    { id: 'experiences', label: 'Experiences', icon: Compass },
    { id: 'planner', label: 'Trip Planner', icon: CalendarDays },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
    { id: 'map', label: 'Interactive Map', icon: Map }
  ];

  const headerClass = isOverHero
    ? "absolute top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-transparent border-transparent text-white"
    : "sticky top-0 z-50 w-full transition-all duration-300 bg-royal-950 border-b border-royal-900 text-white shadow-md";

  const openLogin = () => { setAuthModalMode('login'); setAuthModalOpen(true); };
  const openRegister = () => { setAuthModalMode('register'); setAuthModalOpen(true); };

  return (
    <>
      <header id="main-app-header" className={headerClass}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo */}
          <div 
            id="brand-logo-container" 
            className="flex cursor-pointer items-center space-x-2.5 group"
            onClick={() => setActiveTab('discover')}
          >
            <div className="text-gold-400 transition-transform duration-300 group-hover:scale-105">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a1 1 0 0 1 1 1v6.17a4.002 4.002 0 0 1 3.5 3.83 1 1 0 1 1-2 0 2 2 0 0 0-4 0 1 1 0 1 1-2 0 4.002 4.002 0 0 1 3.5-3.83V3a1 1 0 0 1 1-1zm0 13a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1z" />
                <path d="M6 5a1 1 0 0 1 1 1v2a5 5 0 0 0 10 0V6a1 1 0 1 1 2 0v2a7 7 0 0 1-14 0V6a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-sans text-[9px] uppercase tracking-[0.08em] text-gold-300/90 font-semibold">EXPLORE</span>
              <span className="font-manrope text-base font-bold tracking-widest text-white">JOGJA</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-navbar" className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.filter(item => item.id !== 'map').map((item) => {
              const isActive = activeTab === item.id || 
                (item.id === 'events' && activeTab === 'discover-events') || 
                (item.id === 'experiences' && activeTab === 'discover-experiences');
              
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
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
              Interactive Map
            </button>
          </nav>

          {/* Desktop Action Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              id="desktop-saved-icon-btn"
              onClick={() => setActiveTab('saved')}
              className="relative p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <Heart className={`h-5 w-5 ${savedCount > 0 ? 'fill-gold-400 text-gold-400 animate-pulse' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[8px] font-bold text-white">
                  {savedCount}
                </span>
              )}
            </button>

            <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold-400" />
            </button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10">
                  <User className="h-4 w-4 text-gold-400" />
                  <span className="text-xs font-medium text-white/90 max-w-[100px] truncate">
                    {user?.name || 'User'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                  title="Logout"
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
                  <span>Sign In</span>
                </button>
                <button
                  onClick={openRegister}
                  className="px-3 py-1.5 rounded-full bg-gold-600 text-white hover:bg-gold-500 transition-colors text-xs font-semibold"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button 
              onClick={() => setActiveTab('map')}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile top action menu */}
          <div className="flex md:hidden items-center space-x-3">
            <button 
              onClick={() => setActiveTab('saved')} 
              className="relative p-2 rounded-full text-white hover:bg-white/10"
            >
              <Heart className={`h-5 w-5 ${savedCount > 0 ? 'fill-gold-400 text-gold-400' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[8px] font-bold text-white">
                  {savedCount}
                </span>
              )}
            </button>
            
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 text-white hover:bg-white/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div id="mobile-navigation-panel" className="md:hidden border-t border-royal-900 bg-royal-950/95 backdrop-blur-lg animate-fade-in">
            <div className="space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-link-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-gold-800 text-gold-50' 
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

              {/* Mobile Auth */}
              {!isAuthenticated && (
                <div className="pt-2 border-t border-royal-900 mt-2 space-y-2">
                  <button
                    onClick={() => { openLogin(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => { openRegister(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gold-600 px-4 py-3 text-sm font-semibold text-white hover:bg-gold-500"
                  >
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
}
