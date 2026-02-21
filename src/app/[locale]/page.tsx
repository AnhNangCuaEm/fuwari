'use client';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import FeaturedProducts from '@/components/products/FeaturedProducts';
import FavoriteProducts from '@/components/products/FavoriteProducts';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Link } from '@/i18n/navigation';
import { useState } from 'react';

export default function Home() {
  const t = useTranslations();
  const words = t('home.subtitle');
  const title = "Fuwari Sweets";
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
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <section className="pt-24 md:pt-32 px-4 md:px-6 lg:px-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative w-full py-32 md:py-40 flex items-center justify-center text-center rounded-3xl md:rounded-4xl overflow-hidden shadow-xl">
              <Image
                src="/images/hero_img.png"
                alt="Hero Image"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10"></div>
              <div className="relative z-10 flex flex-col items-center gap-6 px-6 md:px-16 lg:px-32">
                <h1 className='text-white text-4xl md:text-6xl lg:text-7xl font-extrabold' style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                  <TextGenerateEffect words={title} />
                </h1>
                <div className="text-white text-lg md:text-xl font-bold max-w-2xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                  <TextGenerateEffect words={words} />
                </div>
                <Link
                  href="/products"
                  className="mt-4 py-4 px-8 rounded-full text-black font-semibold bg-cosmos-200 transition-all duration-300 hover:bg-cosmos-300 hover:scale-105 shadow-lg">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-cosmos-300 font-medium mb-3">{t('home.ourPromise')}</p>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">{t('home.whyChooseUs.title')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t('home.whyChooseUs.description')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className='flex flex-col rounded-2xl md:rounded-3xl p-6 md:p-8 gap-4 bg-[#fff5f5] hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1'>
                <Image
                  src="/icons/bakery.svg"
                  alt={t('home.whyChooseUs.handMadeTitle')}
                  width={48}
                  height={48}
                  className="p-2 bg-white rounded-full"
                />
                <h4 className="text-black text-lg font-bold">{t('home.whyChooseUs.handMadeTitle')}</h4>
                <p className="text-gray-600 leading-relaxed">{t('home.whyChooseUs.handMadeDesc')}</p>
              </div>
              <div className='flex flex-col rounded-2xl md:rounded-3xl p-6 md:p-8 gap-4 bg-[#fefae9] hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1'>
                <Image
                  src="/icons/eco.svg"
                  alt={t('home.whyChooseUs.naturalTitle')}
                  width={48}
                  height={48}
                  className="p-2 bg-white rounded-full"
                />
                <h4 className="text-black text-lg font-bold">{t('home.whyChooseUs.naturalTitle')}</h4>
                <p className="text-gray-600 leading-relaxed">{t('home.whyChooseUs.naturalDesc')}</p>
              </div>
              <div className='flex flex-col rounded-2xl md:rounded-3xl p-6 md:p-8 gap-4 bg-[#F4FCF6] hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1'>
                <Image
                  src="/icons/shipping.svg"
                  alt={t('home.whyChooseUs.freshDeliveryTitle')}
                  width={48}
                  height={48}
                  className="p-2 bg-white rounded-full"
                />
                <h4 className="text-black text-lg font-bold">{t('home.whyChooseUs.freshDeliveryTitle')}</h4>
                <p className="text-gray-600 leading-relaxed">{t('home.whyChooseUs.freshDeliveryDesc')}</p>
              </div>
              <div className='flex flex-col rounded-2xl md:rounded-3xl p-6 md:p-8 gap-4 bg-[#fdf8ff] hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1'>
                <Image
                  src="/icons/heart_outline.svg"
                  alt={t('home.whyChooseUs.heartfeltTitle')}
                  width={48}
                  height={48}
                  className="p-2 bg-white rounded-full"
                />
                <h4 className="text-black text-lg font-bold">{t('home.whyChooseUs.heartfeltTitle')}</h4>
                <p className="text-gray-600 leading-relaxed">{t('home.whyChooseUs.heartfeltDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories - Full Width Background */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto md:h-[500px]">
              {/* Large Item - 2x2 */}
              <Link className="group relative overflow-hidden rounded-2xl md:rounded-3xl col-span-1 md:col-span-2 row-span-2 min-h-[300px]" href="/products/categories/cakes">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                <Image alt="Assorted gourmet cakes on a display" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="/images/categories_section/cakes.png" fill />
                <div className="absolute bottom-6 left-6 z-20">
                  <h5 className="text-white text-2xl md:text-3xl font-serif font-bold mb-1">Cakes</h5>
                  <span className="text-white/90 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now <span>→</span></span>
                </div>
              </Link>
              {/* Small Items */}
              <Link className="group relative overflow-hidden rounded-2xl md:rounded-3xl h-[200px] md:h-full" href="/products/categories/cookies">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                <Image alt="Close up of matcha cookies" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="/images/categories_section/cookies.png" fill />
                <div className="absolute bottom-6 left-6 z-20">
                  <h5 className="text-white text-xl md:text-2xl font-serif font-bold mb-1">Cookies</h5>
                  <span className="text-white/90 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now <span>→</span></span>
                </div>
              </Link>
              <Link className="group relative overflow-hidden rounded-2xl md:rounded-3xl h-[200px] md:h-full" href="/products/categories/macarons">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                <Image alt="Colorful macarons stacked" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="/images/categories_section/macaron.png" fill />
                <div className="absolute bottom-6 left-6 z-20">
                  <h5 className="text-white text-xl md:text-2xl font-serif font-bold mb-1">Macarons</h5>
                  <span className="text-white/90 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now <span>→</span></span>
                </div>
              </Link>
              <Link className="group relative overflow-hidden rounded-2xl md:rounded-3xl md:col-span-2 h-[200px] md:h-full" href="/products/categories/original">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                <Image alt="Original sakura themed sweets" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="/images/categories_section/sweets.png" fill />
                <div className="absolute bottom-6 left-6 z-20">
                  <h5 className="text-white text-xl md:text-2xl font-serif font-bold mb-1">Original Sweets</h5>
                  <span className="text-white/90 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Limited Edition <span>→</span></span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products - Full Width White Background */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-end gap-4 mb-10 md:mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">{t('home.featuredProducts')}</h2>
                <p className="text-gray-600 mt-2">{t('home.featuredProductsDesc')}</p>
              </div>
              <Link
                href="/products"
                className="flex items-center gap-1 text-sm font-bold text-gray-900 border-b border-gray-900 pb-0.5 hover:text-cosmos-400 hover:border-cosmos-400 transition-all whitespace-nowrap"
              >
                {t('common.viewAll')} <span className="text-base">→</span>
              </Link>
            </div>
            <FeaturedProducts />
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="relative w-full h-[450px] md:h-[550px] rounded-2xl md:rounded-3xl overflow-hidden">
              <Image
                src="/images/story_thumb_img.png"
                alt="Our Story Image"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/50 to-black/70"></div>
              <div className="absolute inset-0 flex items-center justify-end p-6 md:p-12 lg:p-16">
                <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col gap-4 md:gap-6 text-white">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold">
                    {t('home.story.title')}
                  </h2>
                  <p className="text-white/90 text-base md:text-lg lg:text-xl leading-relaxed">
                    {t('home.story.description')}
                  </p>
                  <p className="hidden md:block text-white/80 text-base lg:text-lg leading-relaxed">
                    {t('home.story.description2')}
                  </p>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 text-cosmos-200 font-semibold hover:gap-3 hover:text-cosmos-300 transition-all mt-2 group"
                  >
                    {t('home.story.readMore')}
                    <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section - Full Width White */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">{t('home.process.title')}</h2>
              <div className="h-1 w-24 md:w-32 bg-cosmos-300 rounded-full mx-auto"></div>
            </div>
            <div className="relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[2px] border-t-2 border-dashed border-gray-200 z-0"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="size-20 md:size-24 rounded-full bg-white border-4 border-cosmos-50 flex items-center justify-center shadow-sm relative">
                    <Image src="/icons/farm.svg" alt="Step 1" width={40} height={40} className="md:w-12 md:h-12" />
                    <div className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs font-bold size-6 rounded-full flex items-center justify-center">1</div>
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-gray-900">{t('home.process.step1.title')}</h3>
                  <p className="text-sm text-gray-600 max-w-[220px]">{t('home.process.step1.description')}</p>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="size-20 md:size-24 rounded-full bg-white border-4 border-cosmos-50 flex items-center justify-center shadow-sm relative">
                    <Image src="/icons/knead.svg" alt="Step 2" width={40} height={40} className="md:w-12 md:h-12" />
                    <div className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs font-bold size-6 rounded-full flex items-center justify-center">2</div>
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-gray-900">{t('home.process.step2.title')}</h3>
                  <p className="text-sm text-gray-600 max-w-[220px]">{t('home.process.step2.description')}</p>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="size-20 md:size-24 rounded-full bg-white border-4 border-cosmos-50 flex items-center justify-center shadow-sm relative">
                    <Image src="/icons/oven.svg" alt="Step 3" width={40} height={40} className="md:w-12 md:h-12" />
                    <div className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs font-bold size-6 rounded-full flex items-center justify-center">3</div>
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-gray-900">{t('home.process.step3.title')}</h3>
                  <p className="text-sm text-gray-600 max-w-[220px]">{t('home.process.step3.description')}</p>
                </div>
                {/* Step 4 */}
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="size-20 md:size-24 rounded-full bg-white border-4 border-cosmos-50 flex items-center justify-center shadow-sm relative">
                    <Image src="/icons/gift.svg" alt="Step 4" width={40} height={40} className="md:w-12 md:h-12" />
                    <div className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs font-bold size-6 rounded-full flex items-center justify-center">4</div>
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-gray-900">{t('home.process.step4.title')}</h3>
                  <p className="text-sm text-gray-600 max-w-[220px]">{t('home.process.step4.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Favorited Products - Full Width Gray Background */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <FavoriteProducts />
          </div>
        </section>

        {/* Testimonials - Full Width White */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 text-center mb-12 md:mb-16">Sweet Words</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {/* Review 1 */}
              <div className="flex flex-col gap-4 text-center p-6 md:p-8">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Image key={i} src="/icons/star.svg" alt="star" width={18} height={18} />
                  ))}
                </div>
                <p className="text-gray-900 italic font-medium leading-relaxed text-base">&ldquo;{t('home.sweetWords.review1.content')}&rdquo;</p>
                <div className="mt-auto pt-4">
                  <p className="font-bold text-sm text-gray-900">{t('home.sweetWords.review1.author')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('home.sweetWords.verified')}</p>
                </div>
              </div>
              {/* Review 2 */}
              <div className="flex flex-col gap-4 text-center p-6 md:p-8 border-t md:border-t-0 md:border-l md:border-r border-gray-100">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Image key={i} src="/icons/star.svg" alt="star" width={18} height={18} />
                  ))}
                </div>
                <p className="text-gray-900 italic font-medium leading-relaxed text-base">&ldquo;{t('home.sweetWords.review2.content')}&rdquo;</p>
                <div className="mt-auto pt-4">
                  <p className="font-bold text-sm text-gray-900">{t('home.sweetWords.review2.author')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('home.sweetWords.verified')}</p>
                </div>
              </div>
              {/* Review 3 */}
              <div className="flex flex-col gap-4 text-center p-6 md:p-8 border-t md:border-t-0">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Image key={i} src="/icons/star.svg" alt="star" width={18} height={18} />
                  ))}
                </div>
                <p className="text-gray-900 italic font-medium leading-relaxed text-base">&ldquo;{t('home.sweetWords.review3.content')}&rdquo;</p>
                <div className="mt-auto pt-4">
                  <p className="font-bold text-sm text-gray-900">{t('home.sweetWords.review3.author')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('home.sweetWords.verified')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter - Full Width Accent Background */}
        <section className="py-20 md:py-28 bg-[#fdf2f0]">
          <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8 text-center relative">
            <div className="absolute -top-20 -left-20 size-60 bg-cosmos-200/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 size-60 bg-cosmos-200/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-5">
              <Image src="/icons/mail.svg" alt="Mail Icon" width={48} height={48} className='mx-auto' />
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">{t('home.news.title')}</h2>
              <p className="text-gray-600">{t('home.news.description')}</p>
              <form className="flex flex-col sm:flex-row gap-3 mt-4" onSubmit={handleSubmit}>
                <input
                  name='email'
                  autoComplete='email'
                  className="flex-1 py-3 px-5 rounded-full border border-gray-200 focus:border-cosmos-300 focus:ring-2 focus:ring-cosmos-200 outline-none bg-white text-gray-900 placeholder:text-gray-400 transition-all"
                  placeholder={t('home.news.input.placeholder')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  className="px-8 py-3 rounded-full bg-gray-800 text-white font-bold hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
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
              <p className="text-xs text-gray-500 mt-2">{t('home.news.promise')}</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}