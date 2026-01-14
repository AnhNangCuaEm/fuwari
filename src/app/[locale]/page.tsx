'use client';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import FeaturedProducts from '@/components/products/FeaturedProducts';
import FavoriteProducts from '@/components/products/FavoriteProducts';
// import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Link } from '@/i18n/navigation';

export default function Home() {
  // const { data: session, status } = useSession();
  const t = useTranslations();
  const words = t('home.subtitle');
  const title = "Fuwari Sweets";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-16 flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-32 flex items-center justify-center text-center rounded-4xl corner overflow-hidden shadow-xl">
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
            <Link
              href="/products"
              className="py-4 px-6 rounded-full text-black font-semibold bg-cosmos-200 transition-all duration-300 hover:bg-cosmos-300 hover:scale-105">
              Shop Now
            </Link>
          </div>
        </section>

        {/* Why choose Fuwari Sweets? */}
        <section className="mt-20">
          <p className="text-center text-cosmos-300 mb-4">{t('home.ourPromise')}</p>
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-4">{t('home.whyChooseUs.title')}</h3>
          <p className="text-center text-gray-600 mb-12">{t('home.whyChooseUs.description')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className='flex flex-col rounded-3xl p-4 md:p-8 gap-2 md:gap-4 bg-[#fff5f5] hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1'>
              <Image
                src="/icons/bakery.svg"
                alt={t('home.whyChooseUs.handMadeTitle')}
                width={48}
                height={48}
                className="p-2 bg-white rounded-full"
              />
              <h4 className="text-black text-lg font-bold text-left">{t('home.whyChooseUs.handMadeTitle')}</h4>
              <p className="text-left leading-relaxed">{t('home.whyChooseUs.handMadeDesc')}</p>
            </div>
            <div className='flex flex-col rounded-3xl p-4 md:p-8 gap-2 md:gap-4 bg-[#fefae9] hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1'>
              <Image
                src="/icons/eco.svg"
                alt={t('home.whyChooseUs.naturalTitle')}
                width={48}
                height={48}
                className="p-2 bg-white rounded-full"
              />
              <h4 className="text-black text-lg font-bold text-left">{t('home.whyChooseUs.naturalTitle')}</h4>
              <p className="text-left leading-relaxed">{t('home.whyChooseUs.naturalDesc')}</p>
            </div>
            <div className='flex flex-col rounded-3xl p-4 md:p-8 gap-2 md:gap-4 bg-[#F4FCF6] hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1'>
              <Image
                src="/icons/shipping.svg"
                alt={t('home.whyChooseUs.freshDeliveryTitle')}
                width={48}
                height={48}
                className="p-2 bg-white rounded-full"
              />
              <h4 className="text-black text-lg font-bold text-left">{t('home.whyChooseUs.freshDeliveryTitle')}</h4>
              <p className="text-left leading-relaxed">{t('home.whyChooseUs.freshDeliveryDesc')}</p>
            </div>
            <div className='flex flex-col rounded-3xl p-4 md:p-8 gap-2 md:gap-4 bg-[#fdf8ff] hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1'>
              <Image
                src="/icons/heart_outline.svg"
                alt={t('home.whyChooseUs.heartfeltTitle')}
                width={48}
                height={48}
                className="p-2 bg-white rounded-full"
              />
              <h4 className="text-black text-lg font-bold text-left">{t('home.whyChooseUs.heartfeltTitle')}</h4>
              <p className="text-left leading-relaxed">{t('home.whyChooseUs.heartfeltDesc')}</p>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className='mt-20'>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto md:h-[500px]">
            {/* Large Item - 2x2 */}
            <Link className="group relative overflow-hidden rounded-4xl col-span-1 md:col-span-2 row-span-2" href="/products/categories/cakes">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
              <Image alt="Assorted gourmet cakes on a display" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Assorted gourmet cakes on a display" src="/images/categories_section/cakes.png" width={500} height={500} />
              <div className="absolute bottom-6 left-6 z-20">
                <h5 className="text-white text-3xl font-serif font-bold mb-1">Cakes</h5>
                <span className="text-white/90 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now <span className="text-sm">→</span></span>
              </div>
            </Link>
            {/* Small Item 1 - 1x1 (top right) */}
            <Link className="group relative overflow-hidden rounded-4xl h-[240px] md:h-full" href="/products/categories/cookies">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
              <Image alt="Close up of matcha cookies" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Close up of matcha cookies" src="/images/categories_section/cookies.png" width={250} height={250} />
              <div className="absolute bottom-6 left-6 z-20">
                <h5 className="text-white text-2xl font-serif font-bold mb-1">Cookies</h5>
                <span className="text-white/90 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now <span className="text-sm">→</span></span>
              </div>
            </Link>
            {/* Small Item 2 - 1x1 (middle right) */}
            <Link className="group relative overflow-hidden rounded-4xl h-[240px] md:h-full" href="/products/categories/macarons">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
              <Image alt="Colorful macarons stacked" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Colorful macarons stacked" src="/images/categories_section/macaron.png" width={250} height={250} />
              <div className="absolute bottom-6 left-6 z-20">
                <h5 className="text-white text-2xl font-serif font-bold mb-1">Macarons</h5>
                <span className="text-white/90 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now <span className="text-sm">→</span></span>
              </div>
            </Link>
            {/* Small Item 3 - 2x1 (bottom, spans 2 columns) */}
            <Link className="group relative overflow-hidden rounded-4xl md:col-span-2 h-[240px] md:h-full" href="/products/categories/original">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
              <Image alt="Original sakura themed sweets" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Original sakura themed sweets" src="/images/categories_section/sweets.png" width={500} height={250} />
              <div className="absolute bottom-6 left-6 z-20">
                <h5 className="text-white text-2xl font-serif font-bold mb-1">Original Sweets</h5>
                <span className="text-white/90 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Limited Edition <span className="text-sm">→</span></span>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mt-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">{t('home.featuredProducts')}</h3>
              <p className="text-gray-600 mt-2">{t('home.featuredProductsDesc')}</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-bold text-gray-900 border-b border-gray-900 pb-0.5 hover:text-cosmos-400 hover:border-cosmos-400 transition-all"
            >
              {t('common.viewAll')} <span className="text-[16px]">→</span>
            </Link>
          </div>
          <FeaturedProducts />
        </section>

        {/* Story */}
        <section className="mt-20">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-4xl overflow-hidden">
            <Image
              src="/images/story_thumb_img.png"
              alt="Our Story Image"
              width={1248}
              height={500}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/50 to-black/70"></div>

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-end p-8 md:p-12">
              <div className="w-full md:w-2/3 flex flex-col gap-4 md:gap-6 text-white">
                <h3 className="text-2xl md:text-4xl font-serif font-bold">
                  {t('home.story.title')}
                </h3>
                <p className="text-white/90 text-xl leading-relaxed">
                  {t('home.story.description')}
                </p>
                <p className="hidden md:block text-white/80 text-lg leading-relaxed">
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
        </section>

        {/* Process */}
        <section className="mt-20">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-2xl font-serif font-bold text-text-main mb-4">{t('home.process.title')}</h2>
            <div className="h-1 w-32 bg-cosmos-300 rounded-full"></div>
          </div>
          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-gray-200 z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-24 rounded-full bg-white border-4 border-cosmos-50 flex items-center justify-center shadow-sm relative">
                  <Image src="/icons/farm.svg" alt="Step 1" width={48} height={48} />
                  <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs font-bold size-6 rounded-full flex items-center justify-center">1</div>
                </div>
                <h6 className="font-bold text-lg text-text-main">{t('home.process.step1.title')}</h6>
                <p className="text-sm max-w-[200px]">{t('home.process.step1.description')}</p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-24 rounded-full bg-white border-4 border-cosmos-50 flex items-center justify-center shadow-sm relative">
                  <Image src="/icons/knead.svg" alt="Step 2" width={48} height={48} />
                  <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs font-bold size-6 rounded-full flex items-center justify-center">2</div>
                </div>
                <h6 className="font-bold text-lg text-text-main">{t('home.process.step2.title')}</h6>
                <p className="text-sm max-w-[200px]">{t('home.process.step2.description')}</p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-24 rounded-full bg-white border-4 border-cosmos-50 flex items-center justify-center shadow-sm relative">
                  <Image src="/icons/oven.svg" alt="Step 3" width={48} height={48} />
                  <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs font-bold size-6 rounded-full flex items-center justify-center">3</div>
                </div>
                <h6 className="font-bold text-lg text-text-main">{t('home.process.step3.title')}</h6>
                <p className="text-sm max-w-[200px]">{t('home.process.step3.description')}</p>
              </div>
              {/* Step 4 */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-24 rounded-full bg-white border-4 border-cosmos-50 flex items-center justify-center shadow-sm relative">
                  <Image src="/icons/gift.svg" alt="Step 4" width={48} height={48} />
                  <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs font-bold size-6 rounded-full flex items-center justify-center">4</div>
                </div>
                <h6 className="font-bold text-lg text-text-main">{t('home.process.step4.title')}</h6>
                <p className="text-sm max-w-[200px]">{t('home.process.step4.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Favorited Products */}
        <FavoriteProducts />

        {/* Testimonials */}
        <section className="px-4 md:px-10 lg:px-40 py-20 bg-white">
          <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-12">Sweet Words</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="flex flex-col gap-4 text-center p-6">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Image
                    key={i}
                    src="/icons/star.svg"
                    alt="star"
                    width={20}
                    height={20}
                  />
                ))}
              </div>
              <p className="text-gray-900 italic font-medium leading-relaxed">&ldquo;{t('home.sweetWords.review1.content')}&rdquo;</p>
              <div className="mt-2">
                <p className="font-bold text-sm">{t('home.sweetWords.review1.author')}</p>
                <p className="text-xs">{t('home.sweetWords.verified')}</p>
              </div>
            </div>
            {/* Review 2 */}
            <div className="flex flex-col gap-4 text-center p-6 border-l-0 md:border-l border-r-0 md:border-r border-gray-100">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Image
                    key={i}
                    src="/icons/star.svg"
                    alt="star"
                    width={20}
                    height={20}
                  />
                ))}
              </div>
              <p className="text-text-main italic font-medium leading-relaxed">&ldquo;{t('home.sweetWords.review2.content')}&rdquo;</p>
              <div className="mt-2">
                <p className="font-bold text-sm">{t('home.sweetWords.review2.author')}</p>
                <p className="text-xs">{t('home.sweetWords.verified')}</p>
              </div>
            </div>
            {/* Review 3 */}
            <div className="flex flex-col gap-4 text-center p-6">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Image
                    key={i}
                    src="/icons/star.svg"
                    alt="star"
                    width={20}
                    height={20}
                  />
                ))}
              </div>
              <p className="text-text-main italic font-medium leading-relaxed">&ldquo;{t('home.sweetWords.review3.content')}&rdquo;</p>
              <div className="mt-2">
                <p className="font-bold text-sm">{t('home.sweetWords.review3.author')}</p>
                <p className="text-xs">{t('home.sweetWords.verified')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
