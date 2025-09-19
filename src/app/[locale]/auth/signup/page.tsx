'use client';

import RegisterForm from '@/components/forms/RegisterForm';
import BackgroundCarousel from '@/components/ui/BackgroundCarousel';

export default function SignUpPage() {
   const images = [
    '/carouselimg/115.png',
    '/carouselimg/19.png',
    '/carouselimg/25.png',
    '/carouselimg/40.png',
    '/carouselimg/66.png',
    '/carouselimg/124.png',
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden px-4">
          {/* Background Carousel */}
          <div className="absolute inset-0 z-0">
            <BackgroundCarousel images={images} />
          </div>
    
          {/* Content */}
          <div className="relative z-10 w-full">
            <RegisterForm />
          </div>
    
          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-xs sm:text-sm text-black select-none z-10 px-4">
            {new Date().getFullYear()} © Fuwari Sweet Shop. All rights reserved.
          </p>
        </div>
  );
}
