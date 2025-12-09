import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function AboutPage() {
    const t = useTranslations("about");

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

            {/* Header */}
            <div className="relative z-10">
                <Header />
            </div>

            {/* Main content */}
            <div className="relative flex-1 flex flex-col">
                <div className="flex flex-col max-w-[720px] gap-6 mx-auto justify-center py-12 px-4 sm:px-6 lg:px-8 flex-1">
                    <div>
                        <p>{t('pjName')}</p>
                        <h1 className="text-4xl font-bold">Fuwari</h1>
                    </div>
                    <div>
                        <p>{t('genre')}</p>
                        <h2 className="text-2xl font-semibold"> {t('sweetNetShop')}</h2>
                    </div>
                    <div>
                        <p>{t('pjGoal')}</p>
                        <p className="font-semibold">
                            {t('pjGoalDesc')}
                        </p>
                    </div>
                    <div>
                        <p>{t('frameworks')}</p>
                        <p className="font-semibold">
                            Next.js, Tailwind CSS
                        </p>
                    </div>
                    <div>
                        <p>{t('libraries')}</p>
                        <ul className="list-disc list-inside font-semibold">
                            <li>TypeScript</li>
                            <li>Three.js</li>
                            <li>NextAuth.js</li>
                            <li>Stripe</li>
                            <li>react-intl</li>
                            <li>{t('others')}</li>
                        </ul>
                    </div>
                    <div>
                        <p>{t('database')}</p>
                        <p className="font-semibold">PostgreSQL</p>
                    </div>
                    <div>
                        <p>{t('payment')}</p>
                        <p className="font-semibold">Stripe</p>
                    </div>
                    <div>
                        <p>{t('maker')}</p>
                        <p className="font-semibold">レリタンハイ、郁靖ウェン、LIXUEHUI、KAUNG THAR、鍾承翰</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
