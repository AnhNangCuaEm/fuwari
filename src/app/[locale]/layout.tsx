import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Providers from "@/components/Providers";
import LocaleHandler from "@/components/LocaleHandler";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import AnnouncementBanner from '@/components/layout/AnnouncementBanner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fuwari Sweet Shop",
  description: "A delightful shop offering a variety of sweets and treats.",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const {locale} = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'ja' | 'en')) {
    notFound();
  }
  
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  
  // Get session on server side to pass to SessionProvider
  const { auth } = await import('@/lib/auth');
  const session = await auth();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers session={session}>
            <LocaleHandler />
            {children}
            <AnnouncementBanner />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
