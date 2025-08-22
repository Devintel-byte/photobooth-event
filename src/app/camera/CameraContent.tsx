"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProcessingModal from "../components/ProcessingModal";
import { useEdgeStore } from "../../lib/edgestore";
import { generateImage, pollForCompletion } from "../../lib/api";
import Image from "next/image";

export const CameraContent = () => {
  const searchParams = useSearchParams();
  const filterId = searchParams.get("filter_id");
  const ratio = searchParams.get("ratio");
  const gender = searchParams.get("gender");
  const captureMode = searchParams.get("capture_mode");
  const width = Number(searchParams.get("width")) || 768;
  const height = Number(searchParams.get("height")) || 1152;

  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<
    "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "IN_QUEUE"
  >("IN_QUEUE");
  const [jobError, setJobError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { edgestore } = useEdgeStore();
  const router = useRouter();

  const startWebcam = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode: "user",
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .catch((err) => setError("Failed to start webcam."));
          };
        }
      } catch (err) {
        setError("Failed to access webcam. Please allow camera access.");
      }
    };
  
  // init camera
  useEffect(() => {
    if (!filterId || !ratio || !gender || !captureMode || !width || !height) {
      setError("Missing required parameters. Please start over.");
      router.push("/filter");
      return;
    }
    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [filterId, ratio, gender, captureMode, width, height, router]);

  // countdown
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

  // capture to preview
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Camera or canvas not available. Please try again.");
      setIsCapturing(false);
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) {
      setError("Failed to capture photo: Canvas context unavailable.");
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

    context.drawImage(
      videoRef.current,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      0,
      0,
      width,
      height
    );

    const dataUrl = canvasRef.current.toDataURL("image/png");
    setPreviewImage(dataUrl);
    setIsCapturing(false);
  };

  // create composite + upload
  const createCompositeAndUpload = async (generatedBase64: string) => {
    if (!canvasRef.current) throw new Error("Canvas not available");
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

    const OVERLAY_IMAGE = "/Booth_overlay_PRE1.png";
    const generatedUrl = `data:image/jpg;base64,${generatedBase64}`;

    const [genImg, overlayImg] = await Promise.all([
      loadImage(generatedUrl),
      loadImage(OVERLAY_IMAGE),
    ]);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(genImg, 0, 0, width, height);
    ctx.drawImage(overlayImg, 0, 0, width, height);

    const compositeDataUrl = canvas.toDataURL("image/jpg", 0.9);
    const blob = await (await fetch(compositeDataUrl)).blob();

    const file = new File([blob], `ai-photobooth-${Date.now()}.jpg`, {
      type: "image/jpg",
    });

    const uploadResult = await edgestore.publicFiles.upload({
      file,
      options: { temporary: false },
    });

    return uploadResult.url;
  };

  // submit
  const handleUsePhoto = async () => {
    if (!canvasRef.current) {
      setError("Canvas not available. Please try again.");
      return;
    }

    setIsProcessing(true);
    setJobStatus("PROCESSING");

    try {
      const base64Data = canvasRef.current.toDataURL("image/png").split(",")[1];
      const filterIdNum = filterId ? Number(filterId) : null;
      if (!filterIdNum) throw new Error("Filter ID is required");

      const payload = {
        base64: base64Data,
        filter_id: filterIdNum,
        gender: Number(gender),
        capture_mode: Number(captureMode),
        ratio,
      };

      const generation = await generateImage(payload);
      const result = await pollForCompletion(generation.id);

      if (result.status === "COMPLETED" && result.output?.images?.[0]) {
        const finalUrl = await createCompositeAndUpload(result.output.images[0]);
        router.push(
          `/result?final_url=${encodeURIComponent(finalUrl)}&width=${width}&height=${height}`
        );
      } else {
        setJobStatus("FAILED");
        setJobError(result.error || "Image processing failed.");
      }
    } catch (err) {
      setJobStatus("FAILED");
      setJobError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setPreviewImage(null);
    setJobError(null);
    setJobStatus("IN_QUEUE");
    startWebcam();
  };

  const handleCancel = () => router.push("/filter");

  if (error) {
    return <p className="text-red-600 text-center mt-20">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4">
      <div className="flex items-center justify-center mb-5">
        <Image src="/icon_resized.png" alt="logo" width={120} height={120} priority />
      </div>
      <p className="text-center uppercase mt-5 mb-5 text-lg">AI PHOTOBOOTH</p>

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Capture Photo</h1>
        <div
          className="relative bg-black rounded-lg overflow-hidden mb-6"
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          {previewImage ? (
            <Image src={previewImage} alt="Captured" width={width} height={height} />
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
                className={`px-6 py-3 rounded-lg text-white ${
                  isProcessing ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isProcessing ? "Processing..." : "Use this Photo"}
              </button>
              <button
                onClick={handleRetake}
                className="px-6 py-3 rounded-lg text-white bg-gray-600 hover:bg-gray-700 cursor-pointer"
              >
                Retake
              </button>
            </>
          ) : (
            <button
              onClick={startCountdown}
              disabled={isCapturing}
              className={`px-6 py-3 rounded-lg cursor-pointer ${
                isCapturing ? "bg-gray-400" : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isCapturing ? "Capturing..." : "Take Photo"}
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
};
