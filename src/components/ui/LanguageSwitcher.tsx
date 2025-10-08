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
    
    // Remove current locale prefix if it exists
    if (pathname.startsWith('/en/')) {
      pathWithoutLocale = pathname.slice(3); // Remove '/en'
    } else if (pathname === '/en') {
      pathWithoutLocale = '/';
    } else if (pathname.startsWith('/ja/')) {
      pathWithoutLocale = pathname.slice(3); // Remove '/ja'
    } else if (pathname === '/ja') {
      pathWithoutLocale = '/';
    }
    
    // Ensure pathWithoutLocale starts with '/' unless it's empty
    if (pathWithoutLocale && !pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale;
    }
    
    // Build new path with new locale
    let newPath;
    if (newLocale === 'ja') {
      // Japanese is default, no prefix needed
      newPath = pathWithoutLocale || '/';
      // Set a flag to help with redirect handling if needed
      if (pathname.startsWith('/en')) {
        sessionStorage.setItem('redirectToJapanese', 'true');
      }
    } else {
      // Add locale prefix for other languages
      newPath = `/${newLocale}${pathWithoutLocale || ''}`;
    }
    
    // Use window.location.href for reliable navigation
    window.location.href = newPath;
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
