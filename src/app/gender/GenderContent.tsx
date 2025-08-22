'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const GENDER_OPTIONS = [
  { value: 0, label: 'Male' },
  { value: 1, label: 'Female' },
  { value: 2, label: 'Boy' },
  { value: 3, label: 'Girl' },
];

export const GenderSelection = () => {
  const searchParams = useSearchParams();
  const filterId = searchParams.get('filter_id');
  const ratio = searchParams.get('ratio');
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  const [selectedGender, setSelectedGender] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!filterId || !ratio || !width || !height) {
      setError('Missing required parameters. Please start over.');
      router.push('/filters');
    }
  }, [filterId, ratio, width, height, router]);

  const handleNext = () => {
    if (selectedGender !== null && filterId && ratio && width && height) {
      router.push(
        `/capture-mode?filter_id=${filterId}&ratio=${ratio}&gender=${selectedGender}&width=${width}&height=${height}`
      );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 px-4 sm:px-6 lg:px-8">
        <p className="text-center uppercase mt-5 mb-5 text-lg">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className='flex items-center justify-center mb-5'>
        <Image src='/icon_resized.png' alt='Msurface-logo' width={120} height={120} priority />
      </div>
      <p className="text-center uppercase mb-5 text-lg">AI PHOTOBOOTH</p>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Select Gender/Age Group</h1>
        <div className="grid grid-cols-2 gap-4">
          {GENDER_OPTIONS.map((gender) => (
            <motion.div
              key={gender.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedGender === gender.value
                  ? 'bg-slate-600 text-white border-2 border-slate-300'
                  : 'bg-slate-200 hover:bg-slate-100 border border-slate-200 text-gray-600'
              }`}
              onClick={() => setSelectedGender(gender.value)}
            >
              <p className="text-center font-medium">{gender.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-15 flex justify-center">
          <button
            onClick={handleNext}
            disabled={selectedGender === null}
            className={`px-10 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              selectedGender !== null ? 'bg-red-500 hover:bg-red-600 shadow-md text-white' : 'bg-gray-300 text-white cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
