'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import {
  ArrowLeft, Loader2, AlertCircle, Settings, User,
  Lock, ChevronRight, Eye, EyeOff,
} from 'lucide-react';
import { auth, reviews as reviewsApi, type ProfileResponse, type BeReview } from '@/lib/api';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AuthModal from '@/components/AuthModal';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { useLocale } from '@/contexts/LocaleContext';
import ReviewsSection from '@/components/profile/ReviewsSection';
import MyTripsSection from '@/components/profile/MyTripsSection';
import WishlistSection from '@/components/profile/WishlistSection';
import TravelStatisticsCard from '@/components/profile/TravelStatisticsCard';
import RecentlyViewedSection from '@/components/profile/RecentlyViewedSection';
import AICtaBanner from '@/components/profile/AICtaBanner';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';

type Tab = 'overview' | 'settings';

function ProfilePageContent() {
  const router = useRouter();
  const { t } = useLocale();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [userDestinations, setUserDestinations] = useState<{ destination_slug: string; status: string }[]>([]);
  const [userReviews, setUserReviews] = useState<BeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      setAuthModalOpen(true);
      setLoading(false);
      return;
    }
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, destRes] = await Promise.all([
        auth.getProfile(),
        auth.getUserDestinations(),
      ]);

      if (profileRes.status !== 'success' || !profileRes.data) {
        if (!auth.isLoggedIn() || profileRes.message === 'Unauthorized') {
          setAuthModalOpen(true);
          setLoading(false);
          return;
        }
        setError('Failed to load profile');
        setLoading(false);
        return;
      }

      setProfileData(profileRes.data);
      setName(profileRes.data.name || '');
      setPhone(profileRes.data.phone_number || '');

      if (destRes.status === 'success' && destRes.data) {
        setUserDestinations(destRes.data as any);
      }

      try {
        const revRes = await reviewsApi.getByUser(String(profileRes.data.id));
        if (revRes.status === 'success' && revRes.data) {
          setUserReviews(revRes.data);
        }
      } catch {
        // silently fail
      }
    } catch {
      if (!auth.isLoggedIn()) {
        setAuthModalOpen(true);
        setLoading(false);
        return;
      }
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await auth.updateProfile(name, phone || undefined);
      if (res.status === 'success') {
        setProfileSuccess(t('profile.profile_updated'));
        await loadProfile();
      } else {
        if (!auth.isLoggedIn()) { setAuthModalOpen(true); return; }
        setProfileError(res.message || t('profile.profile_update_failed'));
      }
    } catch {
      if (!auth.isLoggedIn()) { setAuthModalOpen(true); return; }
      setProfileError('Network error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess('');
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.passwords_no_match'));
      setPasswordSaving(false);
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t('profile.password_min_chars'));
      setPasswordSaving(false);
      return;
    }
    try {
      const res = await auth.changePassword(currentPassword, newPassword);
      if (res.status === 'success') {
        setPasswordSuccess(t('profile.password_changed'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        if (!auth.isLoggedIn()) { setAuthModalOpen(true); return; }
        setPasswordError(res.message || t('profile.password_change_failed'));
      }
    } catch {
      if (!auth.isLoggedIn()) { setAuthModalOpen(true); return; }
      setPasswordError('Network error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const savedCount   = userDestinations.filter((d) => d.status === 'saved' || d.status === 'wishlist').length;
  const visitedCount = userDestinations.filter((d) => d.status === 'visited').length;

  const userInitials = profileData?.name
    ? profileData.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'YG';

  const handleLogout = async () => {
    try { await auth.logout(); } catch (e) { console.error('Logout error:', e); }
    router.push('/');
  };

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    if (auth.isLoggedIn()) { setLoading(true); loadProfile(); }
    else router.push('/');
  };

  const [copied, setCopied] = React.useState(false);
  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
          <p className="text-sm text-stone-400 font-medium">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-10 shadow-sm border border-stone-200/50 max-w-sm mx-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-royal-950 font-semibold">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-5 px-5 py-2.5 bg-royal-950 text-white text-sm font-semibold rounded-xl hover:bg-royal-800 transition-all"
          >
            {t('profile.back_home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE]">

      <Header
        activeTab="profile"
        setActiveTab={(tab) => router.push(`/?tab=${tab}`)}
        savedCount={savedCount}
      />

      <SubNav
        onBack={() => router.back()}
        title={profileData?.name}
        zClass="z-40"
        centerLinks={[
          { label: t('profile.tab_profile'),  onClick: () => setActiveTab('overview'), active: activeTab === 'overview' },
          { label: t('profile.tab_settings'), onClick: () => setActiveTab('settings'), active: activeTab === 'settings' },
        ]}
        onShare={handleShareProfile}
        copiedToast={copied}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">

        {profileData && (
          <>
            {activeTab === 'overview' ? (
              <>
                <ProfileHeader
                  profile={profileData}
                  savedCount={savedCount}
                  visitedCount={visitedCount}
                  onShareProfile={handleShareProfile}
                  onProfileUpdate={(updated) => setProfileData(updated)}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <MyTripsSection />
                  <WishlistSection userDestinations={userDestinations} />
                  <TravelStatisticsCard
                    reviewsCount={profileData.reviews_count || 0}
                    savedCount={savedCount}
                  />
                </div>

                <RecentlyViewedSection />

                {userReviews.length > 0 && (
                  <ReviewsSection reviews={userReviews} />
                )}

                <AICtaBanner />
              </>
            ) : (
              <div className="max-w-2xl mx-auto space-y-5">

                <div className="bg-white border border-stone-200/50 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="p-2 bg-stone-100 rounded-xl">
                      <User className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <h3 className="font-manrope font-bold text-base text-royal-950">{t('profile.edit_heading')}</h3>
                      <p className="text-xs text-stone-400">{t('profile.edit_subtitle')}</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-2">{t('profile.full_name')}</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('profile.name_placeholder')}
                        className="w-full bg-stone-50 focus:bg-white border border-stone-200 focus:border-gold-400 text-sm px-4 py-3 rounded-2xl outline-none transition-all duration-200 text-royal-950 placeholder:text-stone-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-2">{t('profile.email')}</label>
                      <div className="relative">
                        <input
                          value={profileData?.email || ''}
                          disabled
                          className="w-full bg-stone-100 border border-stone-200 text-sm px-4 py-3 rounded-2xl outline-none text-stone-400 cursor-not-allowed pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 bg-stone-200 px-2 py-1 rounded-lg uppercase tracking-wide">
                          {t('profile.locked')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-2">{t('profile.phone')}</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t('profile.phone_placeholder')}
                        className="w-full bg-stone-50 focus:bg-white border border-stone-200 focus:border-gold-400 text-sm px-4 py-3 rounded-2xl outline-none transition-all duration-200 text-royal-950 placeholder:text-stone-300"
                      />
                    </div>
                    {profileError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600 font-semibold">{profileError}</p>
                      </div>
                    )}
                    {profileSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                        <ChevronRight className="w-4 h-4 text-green-500 shrink-0" />
                        <p className="text-xs text-green-600 font-semibold">{profileSuccess}</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="w-full py-3 bg-royal-950 hover:bg-royal-800 disabled:opacity-50 text-white text-sm font-semibold rounded-2xl transition-all duration-200"
                    >
                      {profileSaving ? t('profile.saving') : t('profile.save_changes')}
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-stone-200/50 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="p-2 bg-stone-100 rounded-xl">
                      <Lock className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <h3 className="font-manrope font-bold text-base text-royal-950">{t('profile.change_password_heading')}</h3>
                      <p className="text-xs text-stone-400">{t('profile.change_password_subtitle')}</p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {[
                      { label: t('profile.current_password'),      value: currentPassword, setter: setCurrentPassword, show: showCurrentPw, toggle: () => setShowCurrentPw((v) => !v) },
                      { label: t('profile.new_password'),           value: newPassword,     setter: setNewPassword,     show: showNewPw,     toggle: () => setShowNewPw((v) => !v)     },
                      { label: t('profile.confirm_password'),   value: confirmPassword, setter: setConfirmPassword, show: showConfirmPw, toggle: () => setShowConfirmPw((v) => !v) },
                    ].map(({ label, value, setter, show, toggle }) => (
                      <div key={label}>
                        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-2">{label}</label>
                        <div className="relative">
                          <input
                            type={show ? 'text' : 'password'}
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="w-full bg-stone-50 focus:bg-white border border-stone-200 focus:border-gold-400 text-sm px-4 py-3 pr-11 rounded-2xl outline-none transition-all duration-200 text-royal-950"
                          />
                          <button
                            type="button"
                            onClick={toggle}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                          >
                            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {passwordError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600 font-semibold">{passwordError}</p>
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                        <ChevronRight className="w-4 h-4 text-green-500 shrink-0" />
                        <p className="text-xs text-green-600 font-semibold">{passwordSuccess}</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="w-full py-3 bg-royal-950 hover:bg-royal-800 disabled:opacity-50 text-white text-sm font-semibold rounded-2xl transition-all duration-200"
                    >
                      {passwordSaving ? t('profile.changing_password') : t('profile.change_password_btn')}
                    </button>
                  </form>
                </div>

              </div>
            )}
          </>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={handleAuthModalClose} defaultMode="login" />
    </div>
  );
}

export default function ProfilePageClient() {
  return (
    <AuthProvider>
      <LocationProvider>
        <ProfilePageContent />
      </LocationProvider>
    </AuthProvider>
  );
}
