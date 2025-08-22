'use client';

import { useState, useEffect } from 'react';

interface ProcessingModalProps {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'IN_QUEUE';
  error?: string;
  onRetry: () => void;
  onCancel: () => void;
}

const funFacts = [
  "Did you know? The first digital image was created in 1957!",
  "AI can generate images in styles it's never seen before!",
  "Tenacity fuels you, technology elevates you",
  "This is where potential collides with innovation",
  "For the maestros, moguls, magnates",
  "Pro tip: Try different filters for completely unique results!"
];

export default function ProcessingModal({ status, error, onRetry, onCancel }: ProcessingModalProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    if (status === 'PROCESSING' || status === 'PENDING') {
      const interval = setInterval(() => {
        setCurrentFactIndex((prevIndex) => 
          prevIndex === funFacts.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); 

      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          {status === 'FAILED' ? (
            <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative h-12 w-12">
              {/* Outer spinning circle */}
              <svg
                className="animate-spin h-12 w-12 text-red-500 absolute inset-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {/* Inner pulsing dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {status === 'FAILED' ? 'Processing Failed' : 'Processing Image'}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {status === 'FAILED'
            ? error || 'An error occurred while processing your image.'
            : 'Please wait while we apply your selected filter...'}
        </p>

        {(status === 'PROCESSING' || status === 'PENDING') && (
          <div className="min-h-[60px] flex items-center justify-center mb-4">
            <p className="text-sm text-gray-500 italic animate-fadeInOut">
              {funFacts[currentFactIndex]}
            </p>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="flex justify-center gap-4">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-orange-200 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}