'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale});
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
