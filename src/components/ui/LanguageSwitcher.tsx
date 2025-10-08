'use client';

import {useLocale} from 'next-intl';
import {usePathname} from 'next/navigation';
import {routing} from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname(); // Use Next.js pathname to get full path with locale

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
    
    // Get the path without the current locale prefix
    let pathWithoutLocale = pathname;
    routing.locales.forEach(loc => {
      if (pathname.startsWith(`/${loc}/`)) {
        pathWithoutLocale = pathname.slice(loc.length + 1);
      } else if (pathname === `/${loc}`) {
        pathWithoutLocale = '/';
      }
    });
    
    // Build new path with new locale
    let newPath;
    if (newLocale === 'ja') {
      // Japanese is default, no prefix needed
      newPath = pathWithoutLocale;
    } else {
      // Add locale prefix for other languages
      newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    }
    
    // Small delay to ensure localStorage operations complete
    setTimeout(() => {
      window.location.href = newPath;
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
              ? 'bg-almond-6 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {lng === 'ja' ? '日本語' : 'English'}
        </button>
      ))}
    </div>
  );
}
