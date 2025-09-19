'use client';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { useSession } from 'next-auth/react';
import {Link} from '@/i18n/navigation';
import {useTranslations} from 'next-intl';

export default function Home() {
  const { data: session, status } = useSession();
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-16 flex-1">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('home.subtitle')}
          </p>
        </header>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          {status === 'loading' ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : session ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('common.welcome')}、{session.user?.name || session.user?.email}! 👋
              </h2>
              <p className="text-gray-600 mb-6">
                {t('home.welcomeMessage')}
              </p>
              <Link
                href="/mypage"
                className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
              >
                {t('common.myPage')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                {t('home.loginPrompt')}
              </h2>

              <div className="space-y-3">
                <Link
                  href="/auth/signin"
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('common.signin')}
                </Link>

                <Link
                  href="/auth/signup"
                  className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {t('common.signup')}
                </Link>
              </div>

            </div>
          )}
        </div>


        <div className="flex flex-col items-center">
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">🧁</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('products.cupcake.title')}</h3>
              <p className="text-gray-600">{t('products.cupcake.description')}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">🍰</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('products.creamCake.title')}</h3>
              <p className="text-gray-600">{t('products.creamCake.description')}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">🍪</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('products.cookie.title')}</h3>
              <p className="text-gray-600">{t('products.cookie.description')}</p>
            </div>
          </div>
          <Link
            href="/products"
            className="btn mt-4"
          >
            {t('common.products')}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
