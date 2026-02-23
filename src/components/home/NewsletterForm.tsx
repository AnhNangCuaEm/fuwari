'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function NewsletterForm() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);
    setEmail('');
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <section className="py-20 md:py-28 bg-cosmos-50">
      <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8 text-center relative">
        <div className="absolute -top-20 -left-20 size-60 bg-cosmos-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 size-60 bg-cosmos-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-5">
          <Image src="/icons/mail.svg" alt="Mail Icon" width={48} height={48} className='mx-auto' />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-almond-11">{t('home.news.title')}</h2>
          <p className="text-almond-7">{t('home.news.description')}</p>
          <form className="flex flex-col sm:flex-row gap-3 mt-4" onSubmit={handleSubmit}>
            <input
              name='email'
              autoComplete='email'
              className="flex-1 py-3 px-5 rounded-full border border-almond-3 focus:border-cosmos-300 focus:ring-2 focus:ring-cosmos-200 outline-none bg-white text-almond-10 placeholder:text-almond-5 transition-all"
              placeholder={t('home.news.input.placeholder')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              className="px-8 py-3 rounded-full bg-almond-8 text-white font-bold hover:bg-almond-9 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
              type="submit"
              disabled={isLoading || isSuccess}
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSuccess && (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span>{isSuccess ? t('home.news.input.subscribed') : t('home.news.input.button')}</span>
            </button>
          </form>
          <p className="text-xs text-almond-6 mt-2">{t('home.news.promise')}</p>
        </div>
      </div>
    </section>
  );
}
