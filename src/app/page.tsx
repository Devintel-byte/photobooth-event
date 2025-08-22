'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/ms2.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content Container */}
      <div className="relative justify-center z-10 h-full w-full flex flex-col lg:flex-row">
        <div className='absolute right-0 m-12'>
          <Image src='/icon_resized.png' alt='Msurface-logo' width={100} height={100} priority />
        </div>

        {/* Right Side - Text Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center lg:text-left text-white">
          <div className="max-w-md space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              AI PHOTOBOOTH
            </h1>
            
            <p className="text-xl md:text-2xl opacity-90">
              Your all in one photobooth fun experience
            </p>

            <Link 
              href="/select-mode"
              className="inline-block px-8 py-4 bg-white text-black text-xl font-bold rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-xl"
            >
              Take a Photo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}