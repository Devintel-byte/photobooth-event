'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const RatioSelection = () =>{
  const searchParams = useSearchParams();
  const filterId = searchParams.get('filter_id');
  const router = useRouter();

  useEffect(() => {
    if (!filterId) {
      router.push('/filter');
      return;
    }

    // Auto-redirect to gender page with portrait settings
    router.push(`/gender?filter_id=${filterId}&ratio=portrait&width=768&height=1152`);
  }, [filterId, router]);

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className='flex items-center justify-center mb-5'>
        <Image src='/icon_resized.png' alt='Msurface-logo' width={120} height={120} priority />
      </div>
      <p className="text-center uppercase mt-5 mb-10 text-lg">AI PHOTOBOOTH</p>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Loading...</h1>
        <p className="text-center">Setting portrait mode (768 × 1152px)...</p>
      </div>
    </div>
  );
}
