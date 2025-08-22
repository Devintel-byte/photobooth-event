/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Workflow {
  id: number;
  name: string;
  capture_mode: number;
  description: string;
}

const DEFAULT_WORKFLOW: Workflow = {
  id: 30,
  name: 'Quick Animated Single (V4)',
  capture_mode: 1,
  description: 'Fast processing animated style'
};

export const CaptureModeSelection = () => {
  const searchParams = useSearchParams();
  const filterId = searchParams.get('filter_id');
  const ratio = searchParams.get('ratio');
  const gender = searchParams.get('gender');
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  const router = useRouter();

  useEffect(() => {
    if (!filterId || !ratio || !gender || !width || !height) {
      router.push('/filters');
      return;
    }

    // Automatically redirect with workflow ID 30 selected
    router.push(
      `/camera?filter_id=${filterId}&ratio=${ratio}&gender=${gender}&capture_mode=${DEFAULT_WORKFLOW.capture_mode}&width=${width}&height=${height}`
    );
  }, [filterId, ratio, gender, width, height, router]);

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className='flex items-center justify-center mb-5'>
        <Image src='/icon_resized.png' alt='Msurface-logo' width={120} height={120} priority />
      </div>
      <p className="text-center uppercase mt-5 mb-5 text-lg">AI PHOTOBOOTH</p>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Loading Camera...</h1>
      </div>
    </div>
  );
};