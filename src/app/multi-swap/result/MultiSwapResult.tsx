"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCodeModal from "@/app/components/QRCodeModal";

export default function MultiSwapResult() {
  const searchParams = useSearchParams();
  const finalUrl = searchParams.get("final_url");

  const [downloading, setDownloading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleDownload = () => {
    if (!finalUrl) return;
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = finalUrl;
      link.download = `multi-swap-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  if (!finalUrl) {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8">
        <div className="flex items-center justify-center mb-5">
          <Image src="/icon_resized.png" alt="Msurface-logo" width={120} height={120} priority />
        </div>
        <p className="text-center uppercase mb-10 text-lg">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
          <p className="text-center text-red-600">Missing final image</p>
          <div className="mt-6 text-center">
            <Link href="/multi-swap/filter" className="px-6 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700">
              Start Over
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8">
      <div className="flex items-center justify-center mb-5">
        <Image src="/icon_resized.png" alt="Msurface-logo" width={120} height={120} priority />
      </div>
      <p className="text-center uppercase mt-5 mb-5 text-lg">AI PHOTOBOOTH</p>
      <div className="max-w-lg mx-auto bg-slate-100 rounded-xl shadow-md overflow-hidden p-6">
        <div className="text-center">
          <img
            src={finalUrl}
            alt="Generated Group Photo"
            className="rounded-lg max-w-full max-h-[60vh] object-contain mx-auto"
          />
        </div>
        <div className="flex justify-center gap-4 mt-8 mb-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors ${
              downloading ? "opacity-75" : ""
            }`}
          >
            {downloading ? "Downloading..." : "Download"}
          </button>
          <button
            onClick={() => setShowQRModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            Get QR Code
          </button>
          <Link
            href="/select-mode"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            New Photo
          </Link>
        </div>
      </div>

      {showQRModal && <QRCodeModal downloadUrl={finalUrl} onClose={() => setShowQRModal(false)} />}
    </div>
  );
}
