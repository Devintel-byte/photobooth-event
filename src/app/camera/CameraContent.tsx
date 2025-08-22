"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProcessingModal from '../components/ProcessingModal';
import { useEdgeStore } from '../../lib/edgestore';
import { generateImage, pollForCompletion, retrieveImage } from '../../lib/api';
import Image from 'next/image';


export const CameraContent = () => {
  const searchParams = useSearchParams();
  const filterId = searchParams.get('filter_id');
  const ratio = searchParams.get('ratio');
  const gender = searchParams.get('gender');
  const captureMode = searchParams.get('capture_mode');
  const width = Number(searchParams.get('width')) || 768;
  const height = Number(searchParams.get('height')) || 1152;
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'IN_QUEUE'>('IN_QUEUE');
  const [jobError, setJobError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { edgestore } = useEdgeStore();
  const router = useRouter();

  useEffect(() => {
    if (!filterId || !ratio || !gender || !captureMode || !width || !height) {
      setError('Missing required parameters. Please start over.');
      router.push('/filter');
      return;
    }

    const startWebcam = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode: 'user',
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((err) => {
              console.error('Error playing video:', err);
              setError('Failed to start webcam. Please ensure camera access is allowed.');
            });
          };
        }
      } catch (err) {
        let errorMessage = 'Failed to access webcam. Please allow camera access.';
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            errorMessage = 'Camera access denied. Please allow camera permissions in your browser settings.';
          } else if (err.name === 'NotFoundError') {
            errorMessage = 'No camera found. Please ensure a camera is connected.';
          } else if (err.name === 'NotReadableError') {
            errorMessage = 'Camera is in use by another application. Please close other apps using the camera.';
          }
        }
        setError(errorMessage);
      }
    };
    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [filterId, ratio, gender, captureMode, width, height, router]);

  const startCountdown = () => {
    setIsCapturing(true);
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera or canvas not available. Please try again.');
      setIsCapturing(false);
      return;
    }

    const context = canvasRef.current.getContext('2d');
    if (!context) {
      setError('Failed to capture photo: Canvas context unavailable.');
      setIsCapturing(false);
      return;
    }

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const videoRatio = videoRef.current.videoWidth / videoRef.current.videoHeight;
    const canvasRatio = width / height;
    let srcWidth = videoRef.current.videoWidth;
    let srcHeight = videoRef.current.videoHeight;
    let srcX = 0;
    let srcY = 0;

    if (videoRatio > canvasRatio) {
      srcWidth = videoRef.current.videoHeight * canvasRatio;
      srcX = (videoRef.current.videoWidth - srcWidth) / 2;
    } else {
      srcHeight = videoRef.current.videoWidth / canvasRatio;
      srcY = (videoRef.current.videoHeight - srcHeight) / 2;
    }

    context.drawImage(videoRef.current, srcX, srcY, srcWidth, srcHeight, 0, 0, width, height);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setPreviewImage(dataUrl);
    setIsCapturing(false);
  };

 const handleUsePhoto = async () => {
    if (!canvasRef.current) {
      console.error('Canvas not available in handleUsePhoto');
      setError('Canvas not available. Please try capturing the photo again.');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setJobStatus('PROCESSING');

    try {
      // Get full data URL from canvas
      const base64Data = canvasRef.current.toDataURL('image/png');
      
      const filterIdNum = filterId !== null ? Number(filterId) : null;
      if (filterIdNum === null) {
        throw new Error('Filter ID is required');
      }
      const genderNum = Number(gender);
      const captureModeNum = Number(captureMode);
      
      const payload = {
        base64: base64Data.split(',')[1], 
        filter_id: filterIdNum,
        gender: genderNum,
        capture_mode: captureModeNum,
        ratio,
      };

      console.log('Starting image generation...');
      const generation = await generateImage(payload);
      console.log('Image generation started:', generation.id);

      // Start polling for completion
      const result = await pollForCompletion(generation.id);
      
      if (result.status === 'COMPLETED') {
        router.push(`/result?job_id=${generation.id}&filter_id=${filterId}`);
      } else {
        setJobStatus('FAILED');
        setJobError(result.error || 'Image processing failed.');
      }
    } catch (err) {
      setJobStatus('FAILED');
      setJobError(err instanceof Error ? err.message : 'An error occurred during processing.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };


 const handleRetake = () => {
  // Stop the current video stream
  if (videoRef.current && videoRef.current.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }

  // Reset states
  setPreviewImage(null);
  setJobError(null);
  setJobStatus('IN_QUEUE');

  // Reinitialize the camera
  const restartCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: 'user',
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.error('Error playing video:', err);
            setError('Failed to restart webcam. Please refresh the page.');
          });
        };
      }
    } catch (err) {
      console.error('Error restarting camera:', err);
      setError('Failed to restart camera. Please refresh the page.');
    }
  };

  restartCamera();
};

  const handleCancel = () => {
    router.push('/filter');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className='flex items-center justify-center mb-5'>
          <Image src='/icon_resized.png' alt='Msurface-logo' width={120} height={120} priority />
        </div>
        <p className="text-center uppercase mb-10 text-lg">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto">
          <p className="text-red-600 text-center">{error}</p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push('/filter')}
              className="px-6 py-3 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
            >
              Start Over
            </button>
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
      <p className="text-center uppercase mt-5 mb-5 text-lg">AI PHOTOBOOTH</p>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Capture Photo</h1>
        <div
          className="relative bg-black rounded-lg overflow-hidden mb-6"
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          {previewImage ? (
            <Image src={previewImage} alt="Captured Photo" className="w-full h-full object-cover"width={width} height={height} />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
          {/* Always keep canvas in DOM */}
          <canvas ref={canvasRef} className="hidden" />
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-6xl font-bold drop-shadow-lg">{countdown}</span>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4">
          {previewImage ? (
            <>
              <button
                onClick={handleUsePhoto}
                disabled={isProcessing}
                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors cursor-pointer ${
                  isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Use this Photo'}
              </button>
              <button
                onClick={handleRetake}
                className="px-6 py-3 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Retake
              </button>
            </>
          ) : (
            <button
              onClick={startCountdown}
              disabled={isCapturing}
              className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                isCapturing ? 'bg-white text-gray-900 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isCapturing ? 'Capturing...' : 'Take Photo'}
            </button>
          )}
        </div>
      </div>
      {isProcessing && (
        <ProcessingModal 
          status={jobStatus} 
          error={jobError ?? undefined} 
          onRetry={handleUsePhoto} 
          onCancel={handleCancel} 
        />
      )}
    </div>
  );
}