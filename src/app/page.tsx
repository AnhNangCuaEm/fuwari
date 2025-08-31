import {routing} from '@/i18n/routing';
import {redirect} from 'next/navigation';

// This page only renders when a locale is missing from the URL
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
