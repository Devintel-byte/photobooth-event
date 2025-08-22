'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getFilters } from '../../lib/api';

type Filter = { id: number; name: string };

const DEFAULT_FILTERS = [
  { id: 118, name: 'Filter 1' },
  { id: 64, name: 'Filter 2' },
  { id: 72, name: 'Filter 3' },
  { id: 23, name: 'Filter 4' },
  { id: 174, name: 'Filter 5' },
  { id: 19, name: 'Filter 6' },
  { id: 2, name: 'Filter 7' },
  { id: 132, name: 'Filter 8' },
] as const;

// Create a mapping of filter IDs to their preview URLs
const FILTER_PREVIEWS: Record<number, string> = {
  118: '/fil118.jpg',
  64: '/fil64.jpg',
  72: '/fil72.jpg',
  23: '/fil23.jpg',
  174: '/fil174.jpg',
  19: '/fil2.png',
  2: '/fil1.png',
  132: '/fil132.png'
};

const TARGET_FILTER_IDS: number[] = DEFAULT_FILTERS.map(filter => filter.id);

export default function FilterSelection() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const data = await getFilters();
        
        // Filter to only include our target IDs
        const filteredData = data.filter(filter => 
          TARGET_FILTER_IDS.includes(filter.id)
        );
        
        // If we didn't get all filters, fall back to defaults
        if (filteredData.length !== TARGET_FILTER_IDS.length) {
          console.warn('Not all target filters found, using defaults');
          setFilters([...DEFAULT_FILTERS]);
        } else {
          setFilters(filteredData);
        }
      } catch (err) {
        console.error('Error fetching filters:', err);
        setError(`Failed to load filters: ${err instanceof Error ? err.message : 'Unknown error'}. Using defaults.`);
        setFilters([...DEFAULT_FILTERS]);
      } finally {
        setIsFetching(false);
      }
    };
    fetchFilters();
  }, []);

  // Helper function to get preview URL for a filter
  const getPreviewUrl = (filterId: number): string => {
    return FILTER_PREVIEWS[filterId] || '/default-filter.jpg';
  };

  const handleNext = () => {
    if (selectedFilter !== null) {
      setIsLoading(true);
      router.push(`/ratio?filter_id=${selectedFilter}`);
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <div className="aspect-square bg-gray-300 animate-pulse"></div>
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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Select Filter</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filters.map((filter) => (
            <motion.div
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                selectedFilter === filter.id
                  ? 'border-blue-500 ring-2 ring-zinc-100'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
              onClick={() => setSelectedFilter(filter.id)}
            >
              <div className="aspect-auto flex items-center justify-center">
                <Image
                  src={getPreviewUrl(filter.id)}
                  alt={filter.name}
                  className="object-cover w-full h-full"
                  width={400}
                  height={400}
                  priority
                />
              </div>
              {/* <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm p-2">
                <p className="text-center font-medium text-gray-800 truncate">{filter.name}</p>
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