import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ShieldAlert, LogOut, Mail, User as UserIcon, ArrowRight, Bike } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, logout, updateProfile, navigateTo, isAdmin } = useRestaurant();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone_number || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    if (!fullName.trim()) {
      setSaveError('Name is required.');
      return;
    }

    if (!phoneNumber.trim()) {
      setSaveError('Phone number is required.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
      });

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error || 'Unable to update your profile.');
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
  };

  const handleAdminPortal = () => {
    navigateTo({ type: 'admin' });
  };

  const handleCourierDeliveries = () => {
    navigateTo({ type: 'courier' });
  };

  return (
    <div className="min-h-[calc(100vh-18rem)] bg-[#FFF8ED] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827]">Your Profile</h1>
          <p className="mt-2 text-sm text-[#475569]">Manage your account details and preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-6">
          {/* Avatar & Name Display */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#C8102E] text-2xl font-bold text-white">
              {currentUser?.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827]">{currentUser?.full_name}</h2>
              <p className="text-sm text-[#475569]">{currentUser?.role}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E5E7EB]" />

          {/* Status Messages */}
          {saveError && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200"
            >
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div
              role="status"
              className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200"
            >
              Profile updated successfully.
            </div>
          )}

          {/* Editable Fields Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#111827]">Edit Profile</h3>

            {/* Full Name */}
            <div>
              <label htmlFor="profile-full-name" className="block text-sm font-medium text-[#111827] mb-1.5">
                Full Name
              </label>
              <input
                id="profile-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:ring-offset-1 disabled:opacity-60"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-[#111827] mb-1.5">
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:ring-offset-1 disabled:opacity-60"
                placeholder="e.g., +234 80 1234 5678"
              />
              <p className="mt-1 text-xs text-[#6B7280]">Format: +234 + 10 digits (e.g., +2348012345678)</p>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full rounded-lg bg-[#C8102E] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#A70D26] disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 min-h-[44px]"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E5E7EB]" />

          {/* Read-Only Fields Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#111827]">Account Information</h3>

            {/* Email (Read-Only) */}
            <div className="flex items-center gap-3 rounded-lg bg-[#F9FAFB] px-4 py-3">
              <Mail className="h-5 w-5 flex-shrink-0 text-[#6B7280]" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#6B7280]">Email Address</p>
                <p className="truncate text-sm font-medium text-[#111827]">{currentUser?.email}</p>
              </div>
            </div>

            {/* Role (Read-Only) */}
            <div className="flex items-center gap-3 rounded-lg bg-[#F9FAFB] px-4 py-3">
              <UserIcon className="h-5 w-5 flex-shrink-0 text-[#6B7280]" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#6B7280]">Account Type</p>
                <p className="text-sm font-medium text-[#111827]">{currentUser?.role || 'Customer'}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E5E7EB]" />

          {/* Quick Actions Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#111827]">Quick Actions</h3>

            {/* Admin Portal Button (Admin Only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={handleAdminPortal}
                className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-[#D4AF37]/60 bg-[#FFFBF0] px-4 py-3 text-sm font-semibold text-[#111827] transition-all hover:bg-[#D4AF37]/10 active:scale-95"
              >
                <span className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-[#D4AF37]" />
                  Admin Portal
                </span>
                <ArrowRight className="h-4 w-4 text-[#6B7280]" />
              </button>
            )}

            {currentUser?.role === 'COURIER' && (
              <button
                type="button"
                onClick={handleCourierDeliveries}
                className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-[#D4AF37]/60 bg-[#FFFBF0] px-4 py-3 text-sm font-semibold text-[#111827] transition-all hover:bg-[#D4AF37]/10 active:scale-95"
              >
                <span className="flex items-center gap-3">
                  <Bike className="h-5 w-5 text-[#C8102E]" />
                  My Assigned Deliveries
                </span>
                <ArrowRight className="h-4 w-4 text-[#6B7280]" />
              </button>
            )}

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 active:scale-95"
            >
              <span className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                Sign Out
              </span>
              <ArrowRight className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
