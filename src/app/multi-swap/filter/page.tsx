'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getMultiSwapFilters } from '@/lib/api';

const DEFAULT_MULTI_FILTERS = {
  "0": "Gladiator",
  "1": "Cowboy",
  "2": "Manga Pirates",
  "3": "Super Hero",
  "4": "Futuristic Warrior I",
  "5": "DJ",
  "6": "Cyber Hero",
  "7": "Science Fiction Hero",
  "8": "Astronaut",
  "9": "Princess I",
  "10": "Princess II",
  "11": "Futuristic Warrior II",
  "12": "Voxel Hero",
  "13": "Fantasy Warrior",
  "14": "Mermaid",
  "15": "Fantasy Warrior II",
  "16": "Van Gogh Style",
  "17": "Cubism Style",
  "18": "Bauhaus Style",
  "19": "Munch Style",
  "20": "Kandinsky Style",
  "21": "Aquarium",
  "22": "Safari",
  "23": "Jungle",
  "24": "North Pole"
};

const MULTI_FILTER_PREVIEWS: Record<string, string> = {
  "0": "/mult_1.jpg",
  "1": "/mult_2.jpg",
  "2": "/mult_3.jpg",
  "3": "/mult_4.jpg",
  "4": "/mult_5.jpg",
  "5": "/mult_6.jpg",
  "6": "/mult_7.jpg",
  "7": "/mult_8.jpg",
  "8": "/mult_9.jpg",
  "9": "/mult_10.jpg",
  "10": "/mult_11.jpg",
  "11": "/mult_12.jpg",
  "12": "/mult_13.jpg",
  "13": "/mult_14.jpg",
  "14": "/mult_15.jpg",
  "15": "/mult_16.jpg",
  "16": "/mult_17.jpg",
  "17": "/mult_18.jpg",
  "18": "/mult_19.jpg",
  "19": "/mult_20.jpg",
  "20": "/mult_21.jpg",
  "21": "/mult_22.jpg",
  "22": "/mult_23.jpg",
  "23": "/mult_24.jpg",
  "24": "/mult_25.jpg"
};

export default function MultiSwapFilterSelection() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const data = await getMultiSwapFilters();
        setFilters(data);
      } catch (err) {
        console.error('Error fetching multi-swap filters:', err);
        setError('Failed to load filters. Using default filters.');
        setFilters(DEFAULT_MULTI_FILTERS);
      } finally {
        setIsFetching(false);
      }
    };
    fetchFilters();
  }, []);

  const getPreviewUrl = (filterId: string): string => {
    return MULTI_FILTER_PREVIEWS[filterId] || '/filters/multi-default.jpg';
  };

  const handleNext = () => {
    if (selectedFilter !== null) {
      setIsLoading(true);
      router.push(`/multi-swap/camera?style_id=${selectedFilter}`);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className='flex items-center justify-center mb-5'>
          <Image src='/icon_resized.png' alt='Msurface-logo' width={120} height={120} priority />
        </div>
        <p className="text-center uppercase mb-5 text-lg">AI PHOTOBOOTH</p>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Loading Filters...</h1>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Array.from({ length: 25 }).map((_, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <div className="aspect-[4/3] bg-gray-300 animate-pulse"></div>
                <div className="absolute inset-x-0 bottom-0 bg-white/80 p-2">
                  <div className="h-4 bg-gray-400 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Select Filter</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {Object.entries(filters).map(([id, name]) => (
            <motion.div
              key={id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                selectedFilter === id
                  ? 'border-blue-500 ring-2 ring-zinc-100'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
              onClick={() => setSelectedFilter(id)}
            >
              <div className="relative aspect-auto flex items-center justify-center">
                <Image
                  src={getPreviewUrl(id)}
                  alt={name}
                  className="object-cover w-full h-full"
                  width={400}
                  height={300}
                  priority
                />
              </div>
              {/* <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm p-2">
                <p className="text-center font-medium text-gray-800 truncate">{name}</p>
              </div> */}
            </motion.div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleNext}
            disabled={selectedFilter === null || isLoading}
            className={`px-8 py-3 rounded-lg font-semibold text-gray-900 transition-colors cursor-pointer ${
              selectedFilter !== null && !isLoading
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}