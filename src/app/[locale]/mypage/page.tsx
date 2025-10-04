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
                <label htmlFor="name" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2 ml-1">
                  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="9" cy="9" r="2" stroke="#1C274C" strokeWidth="1.5"></circle> <path d="M13 15C13 16.1046 13 17 9 17C5 17 5 16.1046 5 15C5 13.8954 6.79086 13 9 13C11.2091 13 13 13.8954 13 15Z" stroke="#1C274C" strokeWidth="1.5"></path> <path d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z" stroke="#1C274C" strokeWidth="1.5"></path> <path d="M19 12H15" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M19 9H14" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M19 15H16" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>
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
                  {t('emailAddress')}
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
                <label htmlFor="phone" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2 ml-1">
                  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90532 10.1147 9.8278C10.1147 9.8278 10.1147 9.8278 10.1147 9.8278C10.1146 9.82792 8.99588 10.9468 11.0245 12.9755C13.0525 15.0035 14.1714 13.8861 14.1722 13.8853C14.1722 13.8853 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C14.1588 20.0658 10.9183 19.5829 7.6677 16.3323C4.41713 13.0817 3.93421 9.84122 4.00655 7.93309C4.04952 6.7996 4.7008 5.77423 5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617Z" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>
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
                <label htmlFor="postalCode" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2 ml-1">
                  <svg fill="#000000" width="20px" height="20px" viewBox="0 0 15 15" id="post-JP" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1.5,3a1,1,0,0,1,1-1h10a1,1,0,0,1,0,2H2.5a1,1,0,0,1-1-.9995Zm11,2.5H2.5a1,1,0,0,0,0,2h4V12a1,1,0,0,0,2,0V7.5h4a1,1,0,0,0,0-2Z"></path> </g></svg>
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
                <label htmlFor="city" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2 ml-1">
                  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 9H7.01M7 13H7.01M7 17H7.01M15 7H15.01M15 11H15.01M15 15H15.01M18 14H18.01M18 18H18.01M9 5H4C3.44772 5 3 5.44772 3 6V20C3 20.5523 3.44772 21 4 21H9M12 4.6V19.4C12 19.9601 12 20.2401 12.109 20.454C12.2049 20.6422 12.3578 20.7951 12.546 20.891C12.7599 21 13.0399 21 13.6 21H19.4C19.9601 21 20.2401 21 20.454 20.891C20.6422 20.7951 20.7951 20.6422 20.891 20.454C21 20.2401 21 19.9601 21 19.4V11.5C21 11.0341 21 10.8011 20.9239 10.6173C20.8224 10.3723 20.6277 10.1776 20.3827 10.0761C20.1989 10 19.9659 10 19.5 10C19.0341 10 18.8011 10 18.6173 9.92388C18.3723 9.82239 18.1776 9.62771 18.0761 9.38268C18 9.19891 18 8.96594 18 8.5V4.6C18 4.03995 18 3.75992 17.891 3.54601C17.7951 3.35785 17.6422 3.20487 17.454 3.10899C17.2401 3 16.9601 3 16.4 3H13.6C13.0399 3 12.7599 3 12.546 3.10899C12.3578 3.20487 12.2049 3.35785 12.109 3.54601C12 3.75992 12 4.03995 12 4.6Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
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
                <label htmlFor="address" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2 ml-1">
                  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M22 22L2 22" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M2 11L10.1259 4.49931C11.2216 3.62279 12.7784 3.62279 13.8741 4.49931L22 11" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M15.5 5.5V3.5C15.5 3.22386 15.7239 3 16 3H18.5C18.7761 3 19 3.22386 19 3.5V8.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M4 22V9.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M20 22V9.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M15 22V17C15 15.5858 15 14.8787 14.5607 14.4393C14.1213 14 13.4142 14 12 14C10.5858 14 9.87868 14 9.43934 14.4393C9 14.8787 9 15.5858 9 17V22" stroke="#1C274C" strokeWidth="1.5"></path> <path d="M14 9.5C14 10.6046 13.1046 11.5 12 11.5C10.8954 11.5 10 10.6046 10 9.5C10 8.39543 10.8954 7.5 12 7.5C13.1046 7.5 14 8.39543 14 9.5Z" stroke="#1C274C" strokeWidth="1.5"></path> </g></svg>
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
            <div className="flex justify-between flex-col mt-4 pt-4 border-t border-gray-200 gap-4 md:flex-row md:items-center">
              <div className="flex space-x-3 mb-4 md:mb-0">
                <Link
                  href="/orders"
                  className="text-xs sm:text-base px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                >
                  📦 {t('viewOrders')}
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-1 text-xs sm:text-base px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                >
                  <svg width="20px" height="20px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>support</title> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="support" fill="#000000" transform="translate(42.666667, 42.666667)"> <path d="M379.734355,174.506667 C373.121022,106.666667 333.014355,-2.13162821e-14 209.067688,-2.13162821e-14 C85.1210217,-2.13162821e-14 45.014355,106.666667 38.4010217,174.506667 C15.2012632,183.311569 -0.101643453,205.585799 0.000508304259,230.4 L0.000508304259,260.266667 C0.000508304259,293.256475 26.7445463,320 59.734355,320 C92.7241638,320 119.467688,293.256475 119.467688,260.266667 L119.467688,230.4 C119.360431,206.121456 104.619564,184.304973 82.134355,175.146667 C86.4010217,135.893333 107.307688,42.6666667 209.067688,42.6666667 C310.827688,42.6666667 331.521022,135.893333 335.787688,175.146667 C313.347976,184.324806 298.68156,206.155851 298.667688,230.4 L298.667688,260.266667 C298.760356,283.199651 311.928618,304.070103 332.587688,314.026667 C323.627688,330.88 300.801022,353.706667 244.694355,360.533333 C233.478863,343.50282 211.780225,336.789048 192.906491,344.509658 C174.032757,352.230268 163.260418,372.226826 167.196286,392.235189 C171.132153,412.243552 188.675885,426.666667 209.067688,426.666667 C225.181549,426.577424 239.870491,417.417465 247.041022,402.986667 C338.561022,392.533333 367.787688,345.386667 376.961022,317.653333 C401.778455,309.61433 418.468885,286.351502 418.134355,260.266667 L418.134355,230.4 C418.23702,205.585799 402.934114,183.311569 379.734355,174.506667 Z M76.8010217,260.266667 C76.8010217,269.692326 69.1600148,277.333333 59.734355,277.333333 C50.3086953,277.333333 42.6676884,269.692326 42.6676884,260.266667 L42.6676884,230.4 C42.6676884,224.302667 45.9205765,218.668499 51.2010216,215.619833 C56.4814667,212.571166 62.9872434,212.571166 68.2676885,215.619833 C73.5481336,218.668499 76.8010217,224.302667 76.8010217,230.4 L76.8010217,260.266667 Z M341.334355,230.4 C341.334355,220.97434 348.975362,213.333333 358.401022,213.333333 C367.826681,213.333333 375.467688,220.97434 375.467688,230.4 L375.467688,260.266667 C375.467688,269.692326 367.826681,277.333333 358.401022,277.333333 C348.975362,277.333333 341.334355,269.692326 341.334355,260.266667 L341.334355,230.4 Z"> </path> </g> </g> </g></svg>
                  {t('contactSupport')}
                </Link>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-1 text-xs sm:text-base sm:px-4 sm:py-3 bg-red-200 rounded-lg px-2 py-2 hover:bg-red-100 transition-colors text-red-600 cursor-pointer"
                >
                  <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M15 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H15" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M19 12L15 8M19 12L15 16M19 12H9" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></g></svg>
                  {tCommon('logout')}
                </button>
                <button
                  onClick={handleReset}
                  disabled={!hasChanges() || isSaving}
                  className="text-xs sm:text-base px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed reset-button"
                >
                  {t('reset')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges() || isSaving}
                  className="text-xs sm:text-base px-3 py-2 sm:px-4 sm:py-3 bg-almond-6 text-white rounded-lg hover:bg-almond-5 focus:ring-2 focus:ring-almond-5 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 save-button"
                >
                  {isSaving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-almond-5 loading-spinner"></div>
                  )}
                  <span>{isSaving ? t('saving') : t('saveChanges')}</span>
                </button>
              </div>

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