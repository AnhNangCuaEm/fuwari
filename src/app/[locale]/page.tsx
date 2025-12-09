'use client';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
// import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export default function Home() {
  // const { data: session, status } = useSession();
  const t = useTranslations();
  const words = t('home.subtitle');
  const title = "Fuwari Sweets";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-16 flex-1">
        <section className="relative w-full py-32 flex items-center justify-center text-center rounded-3xl overflow-hidden shadow-xl">
          <Image
            src="/images/hero_img.png"
            alt="Hero Image"
            width={1000}
            height={800}
            className="absolute inset-0 w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-black/10"></div>
          <div className="relative z-10 flex flex-col items-center gap-6 px-4 md:px-32">
            <h1 className='text-white text-5xl md:text-7xl font-extrabold mb-4' style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              <TextGenerateEffect words={title} />
            </h1>
            <div className="text-white leading-8 md:leading-20 text-xl md:text-xl font-black" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              <TextGenerateEffect words={words} />
            </div>
            <button className="py-4 px-6 rounded-full text-black font-semibold bg-[#FADADD] transition-all duration-300 transform hover:scale-105">
              Shop Now
            </button>
          </div>
        </section>


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
        </div>
      </div>
      <Footer />
    </div>
  );
}
