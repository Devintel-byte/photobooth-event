/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { generateMultiSwapImage, pollForMultiSwapCompletion } from "@/lib/api";
import Image from "next/image";
import ProcessingModal from "@/app/components/ProcessingModal";
import { useEdgeStore } from "@/lib/edgestore";

export default function MultiSwapCamera() {
  const searchParams = useSearchParams();
  const styleId = searchParams.get("style_id");
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobStatus, setJobStatus] = useState<
    "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "IN_QUEUE"
  >("IN_QUEUE");
  const [jobError, setJobError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const { edgestore } = useEdgeStore();

  // Landscape dimensions
  const width = 1024;
  const height = 768;

  useEffect(() => {
    if (!styleId) {
      setError("Missing style ID. Please start over.");
      router.push("/multi-swap/filter");
      return;
    }

    const startWebcam = async () => {
      try {
        const constraints = {
          video: { width: { ideal: width }, height: { ideal: height }, facingMode: "user" },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((err) => {
              console.error("Error playing video:", err);
              setError("Failed to start webcam. Please ensure camera access is allowed.");
            });
          };
        }
      } catch (err) {
        setError("Failed to access webcam. Please allow camera access.");
      }
    };
    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [styleId, router]);

  const startCountdown = () => {
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
      setError("Camera or canvas not available. Please try again.");
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) {
      setError("Failed to capture photo: Canvas context unavailable.");
      return;
    }

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    context.drawImage(videoRef.current, 0, 0, width, height);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setPreviewImage(dataUrl);
  };

  const createCompositeAndUpload = async (generatedBase64: string) => {
    if (!canvasRef.current) throw new Error("Canvas not available");
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

    const generatedUrl = `data:image/jpg;base64,${generatedBase64}`;
    const overlayUrl = "/Booth_overlay_PRE1.png";

    const [genImg, overlayImg] = await Promise.all([
      loadImage(generatedUrl),
      loadImage(overlayUrl),
    ]);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(genImg, 0, 0, width, height);
    ctx.drawImage(overlayImg, 0, 0, width, height);

    const compositeDataUrl = canvas.toDataURL("image/jpg", 0.9);
    const blob = await (await fetch(compositeDataUrl)).blob();
    const file = new File([blob], `multi-swap-${Date.now()}.jpg`, { type: "image/jpg" });

    const uploadResult = await edgestore.publicFiles.upload({
      file,
      options: { temporary: false },
    });

    return uploadResult.url;
  };

  const handleUsePhoto = async () => {
    if (!canvasRef.current || !styleId) {
      setError("Canvas not available or missing style ID.");
      return;
    }

    setIsProcessing(true);
    setJobStatus("PROCESSING");
    setJobError(null);

    try {
      const base64Data = canvasRef.current.toDataURL("image/png").split(",")[1];

      const generation = await generateMultiSwapImage({
        input_image: base64Data,
        style_id: Number(styleId),
        overlay: false,
      });

      if (!generation?.id) throw new Error("Failed to start image generation");

      const result = await pollForMultiSwapCompletion(generation.id);

      if (result?.status === "COMPLETED" && result.output?.images?.[0]) {
        const finalUrl = await createCompositeAndUpload(result.output.images[0]);
        router.push(`/multi-swap/result?final_url=${encodeURIComponent(finalUrl)}`);
      } else {
        throw new Error(result?.error || "Image processing failed");
      }
    } catch (err) {
      setJobStatus("FAILED");
      setJobError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => router.push("/multi-swap/filter");

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center mb-5">
        <Image src="/icon_resized.png" alt="Msurface-logo" width={120} height={120} priority />
      </div>
      <p className="text-center uppercase mt-5 mb-5 text-lg">AI PHOTOBOOTH</p>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Group Photo</h1>
        <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ aspectRatio: `${width}/${height}` }}>
          {previewImage ? (
            <Image src={previewImage} alt="Captured Photo" width={width} height={height} className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
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
                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isProcessing ? "Processing..." : "Use this Photo"}
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-6 py-3 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
              >
                Retake
              </button>
            </>
          ) : (
            <button
              onClick={startCountdown}
              className="px-6 py-3 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
            >
              Take Photo
            </button>
          )}
        </div>
      </div>
      {isProcessing && (
        <ProcessingModal status={jobStatus} error={jobError ?? undefined} onRetry={handleUsePhoto} onCancel={handleCancel} />
      )}
    </div>
  );
}
