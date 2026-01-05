'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languageNames: Record<string, string> = {
  ja: '日本語',
  en: 'English'
};

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    // Save current cart state before language switch
    try {
      const currentCart = localStorage.getItem('fuwari-cart')
      if (currentCart) {
        // Temporarily store cart in a backup key
        localStorage.setItem('fuwari-cart-backup', currentCart)
      }
    } catch (error) {
      console.error('Error backing up cart before locale change:', error)
    }

    // Small delay to ensure localStorage operations complete
    setTimeout(() => {
      router.replace(pathname, { locale: newLocale });
      onClose();
    }, 10);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000c2] z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-almond-1 rounded-xl shadow-xl p-6 w-70 max-w-sm mx-4 z-[70]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {t('common.selectLanguage')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {routing.locales.map((lng) => (
            <button
              key={lng}
              onClick={() => handleLocaleChange(lng)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${locale === lng
                  ? 'bg-almond-5 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{languageNames[lng]}</span>
                {locale === lng && (
                  <span className="text-sm">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
