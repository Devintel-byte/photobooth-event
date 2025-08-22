/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import QRCodeModal from "../components/QRCodeModal";

export const ResultPage = () => {
  const searchParams = useSearchParams();
  const finalUrl = searchParams.get("final_url");
  const width = Number(searchParams.get("width")) || 768;
  const height = Number(searchParams.get("height")) || 1152;

  const [downloading, setDownloading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  if (!finalUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Missing final image URL. Please try again.
      </div>
    );
  }

  const handleDownload = () => {
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = finalUrl;
      link.download = `ai-photobooth-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8">
      <div className="flex items-center justify-center mb-5">
        <Image src="/icon_resized.png" alt="logo" width={120} height={120} priority />
      </div>
      <p className="text-center uppercase mt-5 mb-5 text-lg">AI PHOTOBOOTH</p>

      <div className="max-w-md mx-auto bg-slate-100 rounded-xl shadow-md overflow-hidden p-6 md:p-8">
        <div className="text-center">
          <div className="mb-5 flex justify-center">
            <div
              className="relative"
              style={{ width: `${width}px`, height: `${height}px`, maxWidth: "100%", maxHeight: "60vh" }}
            >
              <Image
                src={finalUrl}
                alt="Generated Photo with Overlay"
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8 mb-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 ${
              downloading ? "opacity-75" : ""
            }`}
          >
            {downloading ? "Downloading..." : "Download"}
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            Get QR Code
          </button>

          <Link
            href="/select-mode"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            New Photo
          </Link>
        </div>
      </div>

      {showQRModal && (
        <QRCodeModal downloadUrl={finalUrl} onClose={() => setShowQRModal(false)} />
      )}
    </div>
  );
};
