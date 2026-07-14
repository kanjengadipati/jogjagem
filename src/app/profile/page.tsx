'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { auth, type ProfileResponse } from '../../lib/api';
import ProfileHeader from '../../components/profile/ProfileHeader';
import TravelStatisticsCard from '../../components/profile/TravelStatisticsCard';

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  // Mock data to match the component interfaces for now
  const mockProfile = profileData ? {
    name: profileData.name,
    title: 'Senior Explorer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
    coverImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200&h=400',
    level: 5,
    destinationsCount: 12,
    reviewsCount: 8,
    likesCount: 45,
    tripsCount: 3
  } : null;

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.push('/');
      return;
    }
    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      const res = await auth.getProfile();
      if (res.status === 'success' && res.data) {
        setProfileData(res.data);
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
      } else {
        setError('Failed to load profile');
      }
    } catch {
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
        setProfileSuccess('Profile updated successfully');
        await loadProfile();
      } else {
        setProfileError(res.message || 'Failed to update profile');
      }
    } catch {
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
      setPasswordError('New passwords do not match');
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await auth.changePassword(currentPassword, newPassword);
      if (res.status === 'success') {
        setPasswordSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.message || 'Failed to change password');
      }
    } catch {
      setPasswordError('Network error');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-royal-950 font-medium">{error}</p>
          <button onClick={() => router.push('/')} className="mt-4 text-sm text-gold-600 hover:text-gold-700 underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="bg-royal-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Explore</span>
          </button>
          <h1 className="font-manrope text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {mockProfile && (
          <>
            <ProfileHeader profile={mockProfile} onEditProfile={() => {}} />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Existing forms can go here */}
              </div>
              <div>
                <TravelStatisticsCard profile={mockProfile} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
