'use client';

interface BackgroundCarouselProps {
  images: string[];
  className?: string;
}

export default function BackgroundCarousel({ images, className = '' }: BackgroundCarouselProps) {
  const duplicatedImages = [...images, ...images];

  return (
    <div className={`h-full w-full flex items-center overflow-hidden ${className}`}>
      <div className="flex gap-6 carousel-animate">
        {duplicatedImages.map((image, index) => (
          <div
            key={index}
            className="w-80 h-80 bg-contain bg-center bg-no-repeat opacity-70"
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>
    </div>
  );
}
