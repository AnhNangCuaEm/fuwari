'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function LocaleHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we're on an English path but want to switch to Japanese (default)
    // This helps handle the case where users get stuck on /en paths
    if (typeof window !== 'undefined') {
      const shouldRedirectToJapanese = sessionStorage.getItem('redirectToJapanese');
      if (shouldRedirectToJapanese === 'true' && pathname.startsWith('/en')) {
        sessionStorage.removeItem('redirectToJapanese');
        const pathWithoutLocale = pathname.slice(3) || '/';
        window.location.href = pathWithoutLocale;
      }
    }
  }, [pathname, router]);

  return null;
}
