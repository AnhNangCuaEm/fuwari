import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ConditionalAuthContent } from "@/components/auth/AuthGuards";
import { getCurrentUser } from "@/lib/auth-utils";
import { Link } from "@/i18n/navigation";
import { getTranslations } from 'next-intl/server';
import Image from "next/image";

export default async function ContactPage() {
    const currentUser = await getCurrentUser();
    const t = await getTranslations('contact');

        const decorativeImages = [
        '/carouselimg/115.png',
        '/carouselimg/19.png',
        '/carouselimg/25.png',
        '/carouselimg/40.png',
        '/carouselimg/66.png',
        '/carouselimg/124.png',
    ];

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Background decorative images */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Image
                    src={decorativeImages[0]}
                    alt=""
                    width={200}
                    height={200}
                    className="absolute top-10 left-10 opacity-40 rotate-12 w-32 h-32 object-cover"
                />
                <Image
                    src={decorativeImages[1]}
                    alt=""
                    width={150}
                    height={150}
                    className="absolute top-20 right-20 opacity-40 -rotate-6 w-24 h-24 object-cover"
                />
                <Image
                    src={decorativeImages[2]}
                    alt=""
                    width={180}
                    height={180}
                    className="absolute bottom-32 left-16 opacity-40 rotate-45 w-36 h-36 object-cover"
                />
                <Image
                    src={decorativeImages[3]}
                    alt=""
                    width={120}
                    height={120}
                    className="absolute bottom-20 right-32 opacity-40 -rotate-12 w-32 h-32 object-cover"
                />
                <Image
                    src={decorativeImages[4]}
                    alt=""
                    width={160}
                    height={160}
                    className="absolute top-1/2 left-8 opacity-40 rotate-30 w-26 h-26 object-cover"
                />
                <Image
                    src={decorativeImages[5]}
                    alt=""
                    width={140}
                    height={140}
                    className="absolute top-1/3 right-12 opacity-40 -rotate-25 w-22 h-22 object-cover"
                />
            </div>
            <Header />
            <div className="flex items-center justify-center pt-32 pb-16 px-4 sm:px-6 lg:px-8 flex-1 z-10">
                <div className="max-w-4xl w-fit text-center">
                    <h1 className="text-4xl font-bold mb-6">{t('title')}</h1>
                    <p className="text-lg text-gray-600 mb-4">{t('subtitle')}</p>

                    {/* Show different content based on auth status */}
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        {currentUser ? (
                            <div>
                                <p className="text-green-600">
                                    {t('Hi')} <strong>{currentUser.name}</strong>
                                    <br />
                                    {t('howCanWeHelp')}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xl text-gray-600 mb-4">
                                    {t('notLoggedInMessage')}
                                </p>
                                <Link
                                    href="/auth/signin"
                                    className="inline-block px-4 py-2 bg-almond-5 text-white rounded hover:bg-almond-6"
                                >
                                    {t('loginNow')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Show content only for logged-in users */}
                    <ConditionalAuthContent
                        requireAuth={true}
                    >
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                            <h3 className="font-semibold text-green-800 mb-2">
                                会員専用コンテンツ
                            </h3>
                            <p className="text-green-700">
                                これはログインしたユーザー専用の特別なコンテンツです！
                            </p>
                        </div>
                    </ConditionalAuthContent>

                    {/* Show content only for admins */}
                    <ConditionalAuthContent
                        adminOnly={true}
                        fallback={null}
                    >
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                            <h3 className="font-semibold text-red-800 mb-2">
                                Adminコンテンツ
                            </h3>
                            <p className="text-red-700">
                                この部分は管理者のみが見ることができます！
                            </p>
                        </div>
                    </ConditionalAuthContent>
                </div>
            </div>
            <Footer />
        </div>
    );
}