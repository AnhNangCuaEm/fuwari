'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function Footer() {
    const t = useTranslations('footer')

    return (
        <footer className="relative pt-16 pb-0">
            {/* SVG Wave Background */}
            <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 1440 690" 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute inset-0 transition duration-300 ease-in-out delay-150 z-0"
                preserveAspectRatio="none"
            >
                <path 
                    d="M 0,700 L 0,262 C 67.19733629300777,280.9441854729313 134.39467258601553,299.8883709458626 186,287 C 237.60532741398447,274.1116290541374 273.6186459489457,229.39070168948084 319,221 C 364.3813540510543,212.60929831051916 419.130743618202,240.5488222962141 470,233 C 520.869256381798,225.4511777037859 567.8583795782464,182.41400912566283 616,175 C 664.1416204217536,167.58599087433717 713.4357380688124,195.79514120113458 780,227 C 846.5642619311876,258.2048587988654 930.398668146504,292.405426069799 985,265 C 1039.601331853496,237.59457393020105 1064.9695893451722,148.5831545196695 1106,175 C 1147.0304106548278,201.4168454803305 1203.722974472808,343.261955851523 1262,377 C 1320.277025527192,410.738044148477 1380.138512763596,336.3690220742385 1440,262 L 1440,700 L 0,700 Z" 
                    stroke="none" 
                    strokeWidth="0" 
                    fill="#faf3e0" 
                    fillOpacity="1" 
                    className="transition-all duration-300 ease-in-out delay-150"
                />
            </svg>
            
            {/* Footer Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                {/* Top section: Logo + columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    
                    {/* Brand / About Column */}
                    <div className="lg:col-span-1">
                        <Image
                            src="/logo.svg"
                            alt="Fuwari Sweet Shop Logo"
                            width={160}
                            height={40}
                            priority={true}
                            className="w-auto h-auto mb-4"
                        />
                        <p className="text-sm text-almond-8 leading-relaxed mb-4">
                            {t('brandDescription')}
                        </p>
                        {/* Social Icons */}
                        <div className="flex space-x-4">
                            <a href="#" rel="noopener noreferrer" aria-label="Instagram" className="text-almond-6 hover:text-cosmos-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </a>
                            <a href="#" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-almond-6 hover:text-cosmos-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                            <a href="#" rel="noopener noreferrer" aria-label="Facebook" className="text-almond-6 hover:text-cosmos-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a href="#" rel="noopener noreferrer" aria-label="LINE" className="text-almond-6 hover:text-cosmos-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                            </a>
                        </div>
                    </div>

                    {/* Site Map Column */}
                    <div>
                        <h3 className="text-almond-10 font-semibold text-sm uppercase tracking-wider mb-4">{t('siteMap')}</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/" className="text-sm text-almond-8 hover:text-cosmos-500 transition-colors">{t('home')}</Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-sm text-almond-8 hover:text-cosmos-500 transition-colors">{t('menu')}</Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm text-almond-8 hover:text-cosmos-500 transition-colors">{t('aboutUs')}</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-almond-8 hover:text-cosmos-500 transition-colors">{t('contact')}</Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-sm text-almond-8 hover:text-cosmos-500 transition-colors">{t('cart')}</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service Column */}
                    <div>
                        <h3 className="text-almond-10 font-semibold text-sm uppercase tracking-wider mb-4">{t('customerService')}</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/orders" className="text-sm text-almond-8 hover:text-cosmos-500 transition-colors">{t('orderTracking')}</Link>
                            </li>
                            <li>
                                <Link href="/mypage" className="text-sm text-almond-8 hover:text-cosmos-500 transition-colors">{t('myAccount')}</Link>
                            </li>
                            <li>
                                <span className="text-sm text-almond-8">{t('shippingReturns')}</span>
                            </li>
                            <li>
                                <span className="text-sm text-almond-8">{t('privacyPolicy')}</span>
                            </li>
                            <li>
                                <span className="text-sm text-almond-8">{t('termsOfService')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info Column */}
                    <div>
                        <h3 className="text-almond-10 font-semibold text-sm uppercase tracking-wider mb-4">{t('contactUs')}</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-cosmos-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-sm text-almond-8 leading-relaxed">
                                    {t('address')}<br />{t('addressLine2')}
                                </span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-cosmos-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="text-sm text-almond-8">{t('phone')}</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-cosmos-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="text-sm text-almond-8">{t('email')}</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-cosmos-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-sm text-almond-8 leading-relaxed">
                                    {t('businessHoursWeekday')}<br />
                                    {t('businessHoursWeekend')}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-almond-4/50 pt-6 pb-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-almond-7">
                            &copy; {new Date().getFullYear()} {t('copyright')}
                        </p>
                        <div className="flex items-center gap-2">
                            <Image src="/icons/eco.svg" alt={t('ecoFriendly')} width={20} height={20} />
                            <span className="text-xs text-almond-7">{t('ecoFriendly')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
