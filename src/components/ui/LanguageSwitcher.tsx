'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

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
      router.replace(pathname, {locale: newLocale});
    }, 10);
  };

  return (
    <div className="flex items-center space-x-2">
      {routing.locales.map((lng) => (
        <button
          key={lng}
          onClick={() => handleLocaleChange(lng)}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            locale === lng
              ? 'bg-pink-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {lng === 'ja' ? '日本語' : 'English'}
        </button>
      ))}
    </div>
  );
}
