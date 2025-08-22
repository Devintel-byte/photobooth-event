/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { retrieveMultiSwapImage } from '@/lib/api';
import { useEdgeStore } from '@/lib/edgestore';
import QRCodeModal from '@/app/components/QRCodeModal';

type RetrievalResponse = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  output?: { images: string[] };
  error?: string;
};

export default function MultiSwapResult() {
  const searchParams = useSearchParams();
  const [imageLoading, setImageLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jobId = searchParams.get('job_id');
  const styleId = searchParams.get('style_id');
  const [result, setResult] = useState<RetrievalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { edgestore } = useEdgeStore();

  // Landscape dimensions for multi-swap
  const width = 1024;
  const height = 768;
  const OVERLAY_IMAGE = '/Booth_overlay_PRE1.png';

  useEffect(() => {
    if (!jobId || !styleId) {
      setError('Missing required parameters.');
      router.push('/multi-swap/filter');
      return;
    }

    const fetchResult = async () => {
      try {
        const data = await retrieveMultiSwapImage(jobId);
        setResult(data);

        if (data.status === 'COMPLETED' && data.output?.images?.[0]) {
          const fullImageUrl = formatBase64(data.output.images[0]);
          setImageUrl(fullImageUrl);
          await createCompositeImage(fullImageUrl);
        }
      } catch (err) {
        setError('Failed to retrieve image. Please try again.');
        console.error('Result fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [jobId, styleId, router]);

  const loadImage = (src: string, crossOrigin = true): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      if (crossOrigin && !src.startsWith('/')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error(`Failed to load image: ${src}`));
    });
  };

  const createCompositeImage = async (imageUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const [generatedImg, overlayImg] = await Promise.all([
        loadImage(imageUrl, true),
        loadImage(OVERLAY_IMAGE, false)
      ]);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(generatedImg, 0, 0, width, height);
      ctx.drawImage(overlayImg, 0, 0, width, height);

      const compositeDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCompositeImage(compositeDataUrl);
    } catch (err) {
      console.error('Error creating composite image:', err);
      setCompositeImage(imageUrl);
    }
  };

  // Upload only after composite is ready
  useEffect(() => {
    if (compositeImage) {
      (async () => {
        try {
          const response = await fetch(compositeImage);
          const blob = await response.blob();
          const file = new File([blob], `ai-photobooth-${jobId}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          const uploadResult = await edgestore.publicFiles.upload({
            file,
            options: { temporary: false, manualFileName: `ai-photobooth-${jobId}.jpg` }
          });

          setImageUrl(uploadResult.url);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      })();
    }
  }, [compositeImage]);

  const handleDownload = () => {
    const url = imageUrl?.startsWith('http') ? imageUrl : compositeImage;
    if (!url) return;

    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-photobooth-${jobId}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShowQRCode = () => {
    const urlToUse = imageUrl?.startsWith('http') ? imageUrl : null;
    if (urlToUse) setShowQRModal(true);
  };

  const formatBase64 = (base64: string) => {
    if (!base64.startsWith('data:image')) {
      return `data:image/jpeg;base64,${base64}`;
    }
    return base64;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className='flex items-center justify-center mb-5'>
          <Image src='/icon_resized.png' alt='Msurface-logo' width={120} height={120} priority />
        </div>
        <p className="text-center uppercase mt-5 mb-10 text-lg text-gray-900">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="animate-spin h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600">Loading result...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8">
        <div className='flex items-center justify-center mb-5'>
          <Image src='/icon_resized.png' alt='Msurface-logo' width={120} height={120} priority />
        </div>
        <p className="text-center uppercase mb-10 text-lg">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Failed</h2>
            <p className="text-gray-600 mb-6">{error || 'An unknown error occurred.'}</p>
            <Link href="/multi-swap/filter" className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Start Over
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8">
      <canvas ref={canvasRef} className="hidden" />
      <div className='flex items-center justify-center mb-5'>
        <Image src='/icon_resized.png' alt='Msurface-logo' width={120} height={120} priority />
      </div>
      <p className="text-center uppercase mt-5 mb-5 text-lg">AI PHOTOBOOTH</p>
      <div className="max-w-lg mx-auto bg-slate-100 rounded-xl shadow-md overflow-hidden p-6 md:p-8">
        <div className="text-center">
          {result.status === 'COMPLETED' && (compositeImage || result.output?.images?.[0]) && (
            <div className="flex justify-center">
              <img
                src={compositeImage || formatBase64(result.output?.images?.[0] ?? '')}
                alt="Generated Group Photo with Brand Overlay"
                className={`rounded-lg max-w-full max-h-[60vh] object-contain ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                onLoad={() => setImageLoading(false)}
              />
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4 mt-8 mb-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors ${downloading ? 'opacity-75' : ''}`}
          >
            {downloading ? 'Downloading...' : 'Download'}
          </button>
          <button
            onClick={handleShowQRCode}
            disabled={!imageUrl}
            className={`px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors ${!imageUrl ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Get QR Code
          </button>
          <Link href="/select-mode" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            New Photo
          </Link>
        </div>
      </div>

      {showQRModal && imageUrl && imageUrl.startsWith('http') && (
        <QRCodeModal downloadUrl={imageUrl} onClose={() => setShowQRModal(false)} />
      )}
    </div>
  );
}
