import Image from 'next/image'

export default function Footer() {
    return (
        <footer className="relative pt-16 pb-4">
            {/* SVG Background */}
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
            <div className="flex flex-col relative z-10 max-w-7xl gap-2 mx-auto px-4 sm:px-6 lg:px-8">
            <Image
                src="/logo.svg"
                alt="Fuwari Sweet Shop Logo"
                width={250}
                height={100}
                className="mx-auto"
            />
            <p className="text-center">
                &copy; {new Date().getFullYear()}All rights reserved.
            </p>
            </div>
        </footer>
    );
}
