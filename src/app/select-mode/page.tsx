// app/mode-selection/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function SelectMode() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className='flex items-center justify-center mb-5'>
        <Image src='/icon_resized.png' alt='Msurface-logo' width={120} height={120} priority className='h-auto' />
      </div>
      <p className="text-center uppercase mb-5 text-lg">AI PHOTOBOOTH</p>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Select Mode</h1>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 justify-center">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-6 rounded-xl bg-gray-100 border-2 border-gray-200 cursor-pointer"
            onClick={() => router.push('/filter')}
          >
           <div className='flex flex-col items-center justify-center'>
            <Image src='single_person.png' alt='Single Person Select' width={80} height={80} className='object-contain mb-3 w-auto h-auto' priority />
            <h2 className="text-2xl font-bold mb-1 text-center">Single Person</h2>
            <p className="text-gray-600 text-center">Perfect for individual portraits with advanced customization</p>
           </div>
          </motion.div>
          {/* <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-6 rounded-xl bg-gray-100 border-2 border-gray-200 cursor-pointer"
            onClick={() => router.push('/multi-swap/filter')}
          >
            <div className='flex flex-col items-center justify-center relative'>
                <Image src='multi_swap_group_mode.png' alt='MultiSwap Select' width={180} height={180} className='object-contain my-7 w-auto h-auto' priority />
                <h2 className="text-2xl font-bold mb-1 text-center">Group Mode</h2>
                <p className="text-gray-600 text-center">Great for group photos with fun themed filters</p>
            </div>
          </motion.div> */}
        </div>
      </div>
    </div>
  );
}