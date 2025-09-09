'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {useTranslations} from 'next-intl';

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

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#000000c2]" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-80 max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('common.selectLanguage')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2">
          {routing.locales.map((lng) => (
            <button
              key={lng}
              onClick={() => handleLocaleChange(lng)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                locale === lng
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
}
