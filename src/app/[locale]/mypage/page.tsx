'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ImageCropModal from '@/components/ui/ImageCropModal';
import { useTranslations } from 'next-intl';
import { validateAllFields } from '@/lib/validation';
import Link from 'next/link';
import { signOut } from "next-auth/react"
import AlertModal from "@/components/ui/AlertModal";

import '@/css/mypage.css';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  postalCode: number | string;
  city: string;
  address: string;
  image?: string;
}

export default function Mypage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const t = useTranslations('mypage');
  const tCommon = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    handleSignOut();
  };

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    postalCode: '',
    city: '',
    address: '',
    image: ''
  });

  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    postalCode: '',
    city: '',
    address: '',
    image: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToProcess, setImageToProcess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/auth/signin');

    if (session?.user) {
      const loadProfile = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            const profileData = {
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              postalCode: data.user.postalCode || '',
              city: data.user.city || '',
              address: data.user.address || '',
              image: data.user.image || ''
            };
            setProfile(profileData);
            setOriginalProfile(profileData);
          } else {
            // Fallback to session data if API fails
            const initialProfile = {
              name: session.user.name || '',
              email: session.user.email || '',
              phone: '',
              postalCode: '',
              city: '',
              address: '',
              image: session.user.image || ''
            };
            setProfile(initialProfile);
            setOriginalProfile(initialProfile);
          }
        } catch {
          // Fallback to session data if API fails
          const initialProfile = {
            name: session.user.name || '',
            email: session.user.email || '',
            phone: '',
            postalCode: '',
            city: '',
            address: '',
            image: session.user.image || ''
          };
          setProfile(initialProfile);
          setOriginalProfile(initialProfile);
        } finally {
          setIsLoading(false);
        }
      };

      loadProfile();
    }
  }, [session, status, router]);

  const hasChanges = () => {
    return JSON.stringify(profile) !== JSON.stringify(originalProfile);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: t('fileSizeError') });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: t('fileTypeError') });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setImageToProcess(imageSrc);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }

    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleCropComplete = async (croppedImage: string) => {
    try {
      // Convert base64 to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.jpg');

      // Upload to server
      const uploadResponse = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        setProfile(prev => ({
          ...prev,
          image: uploadData.imageUrl
        }));
        setMessage({ type: 'success', text: t('avatarUploadSuccess') });
      } else {
        throw new Error('Upload failed');
      }

    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: t('avatarUploadError') });
    } finally {
      setCropModalOpen(false);
      setImageToProcess(null);
    }
  };

  const handleSave = async () => {
    // Validate all fields before saving
    const validation = validateAllFields(profile);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setMessage({ type: 'error', text: t('validationError') });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setErrors({});

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          address: profile.address.trim(),
          postalCode: profile.postalCode.toString().trim(),
          city: profile.city.trim(),
          image: profile.image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();

      // Update profile state with server response
      if (data.user) {
        const updatedProfile = {
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          postalCode: data.user.postalCode || '',
          city: data.user.city || '',
          address: data.user.address || '',
          image: data.user.image || ''
        };
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);

        // Update session to reflect the new name and image
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
            image: data.user.image
          }
        });
      } else {
        setOriginalProfile(profile);
      }

      setMessage({ type: 'success', text: t('updateSuccess') });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('updateError');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setProfile(originalProfile);
    setErrors({});
    setMessage(null);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-almond-5 mx-auto"></div>
          <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/"
            className="text-[#CC8409] hover:text-[#D6B884] mr-2"
          >
            {t('home')}
          </Link>
          <span className="text-gray-500 mr-2">/</span>
          <span className="text-gray-700">{t('title')}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/orders"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('viewOrders')}
              </Link>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800 message-success'
              : 'bg-red-50 border border-red-200 text-red-800 message-error'
              }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative profile-avatar">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt="Profile Avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                      {profile.name.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                  type="button"
                  aria-label="Upload avatar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">{t('hello')} <span className="font-semibold">{profile.name}</span></h3>
                <p className="text-md text-gray-500">{t('profilePictureDesc')}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fullName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors form-input ${errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder={t('fullNamePlaceholder')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('emailAddress')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed form-input border-gray-300"
                  placeholder={t('emailPlaceholder')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phoneNumber')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors form-input ${errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder={t('phonePlaceholder')}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('postalCode')}
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={profile.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors form-input ${errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder={t('postalCodePlaceholder')}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('city')}
                </label>
                <input
                  type="text"
                  id="city"
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors form-input ${errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder={t('cityPlaceholder')}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('address')}
                </label>
                <input
                  type="text"
                  id="address"
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors form-input ${errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder={t('addressPlaceholder')}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-xs sm:text-base bg-red-200 rounded-lg px-4 py-3 hover:bg-red-100 transition-colors text-red-600 cursor-pointer"
              >
                {tCommon('logout')}
              </button>
              <button
                onClick={handleReset}
                disabled={!hasChanges() || isSaving}
                className="text-xs sm:text-base px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed reset-button"
              >
                {t('reset')}
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges() || isSaving}
                className="text-xs sm:text-base px-6 py-2 bg-almond-6 text-white rounded-lg hover:bg-almond-5 focus:ring-2 focus:ring-almond-5 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 save-button"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-almond-5 loading-spinner"></div>
                )}
                <span>{isSaving ? t('saving') : t('saveChanges')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Remove Item Alert Modal */}
        <AlertModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title={t("logoutAlertTitle")}
          message={t("logoutAlertMsg")}
          type="warning"
          confirmText={t("logoutConfirm")}
          cancelText={t("cancel")}
          onConfirm={handleConfirmLogout}
          showCancel={true}
        />

        {/* Image Crop Modal */}
        {imageToProcess && cropModalOpen && (
          <ImageCropModal
            isOpen={cropModalOpen}
            onClose={() => {
              setCropModalOpen(false);
              setImageToProcess(null);
            }}
            imageSrc={imageToProcess}
            onCropComplete={handleCropComplete}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}