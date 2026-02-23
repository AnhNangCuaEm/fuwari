import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth-utils";
import { getContactMessagesByEmail } from "@/lib/contacts";
import { getTranslations } from 'next-intl/server';
import Image from "next/image";
import ContactForm from "@/components/forms/ContactForm";

export default async function ContactPage() {
    const currentUser = await getCurrentUser();
    const t = await getTranslations('contact');

    // Load previous messages for logged-in users
    const previousMessages = currentUser?.email
        ? await getContactMessagesByEmail(currentUser.email)
        : [];

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
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <Image
                    src={decorativeImages[0]}
                    alt=""
                    width={200}
                    height={200}
                    className="absolute top-10 left-10 opacity-20 rotate-12 w-32 h-32 object-cover"
                />
                <Image
                    src={decorativeImages[1]}
                    alt=""
                    width={150}
                    height={150}
                    className="absolute top-20 right-20 opacity-20 -rotate-6 w-24 h-24 object-cover"
                />
                <Image
                    src={decorativeImages[2]}
                    alt=""
                    width={180}
                    height={180}
                    className="absolute bottom-32 left-16 opacity-20 rotate-45 w-36 h-36 object-cover"
                />
                <Image
                    src={decorativeImages[3]}
                    alt=""
                    width={120}
                    height={120}
                    className="absolute bottom-20 right-32 opacity-20 -rotate-12 w-32 h-32 object-cover"
                />
                <Image
                    src={decorativeImages[4]}
                    alt=""
                    width={160}
                    height={160}
                    className="absolute top-1/2 left-8 opacity-20 rotate-30 w-26 h-26 object-cover"
                />
                <Image
                    src={decorativeImages[5]}
                    alt=""
                    width={140}
                    height={140}
                    className="absolute top-1/3 right-12 opacity-20 -rotate-25 w-22 h-22 object-cover"
                />
            </div>

            <Header />
            
            <div className="flex items-center justify-center pt-32 pb-16 px-4 sm:px-6 lg:px-8 flex-1 z-10">
                <div className="max-w-3xl w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4 text-almond-11">{t('title')}</h1>
                        <p className="text-lg text-almond-7">{t('subtitle')}</p>
                        {currentUser && (
                            <p className="mt-2 text-cosmos-600">
                                {t('Hi')} <strong>{currentUser.name}</strong>! {t('howCanWeHelp')}
                            </p>
                        )}
                    </div>

                    {/* Contact Form */}
                    <ContactForm currentUser={currentUser} previousMessages={previousMessages} />
                </div>
            </div>
            
            <Footer />
        </div>
    );
}