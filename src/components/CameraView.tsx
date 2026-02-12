import React, { useEffect, useRef, useState } from "react";
import { uploadToCloudinary } from "../services/upload";

interface CameraViewProps {
  onCapture: (imageUrl: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ✅ Start Camera Automatically */
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  /* ✅ Start Camera */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
    } catch {
      setError("❌ Camera access denied or not supported.");
    }
  };

  /* ✅ Stop Camera */
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
  };

  /* ✅ Capture + Upload + Identify */
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // ✅ Convert to Base64
      const base64 = canvas.toDataURL("image/jpeg");

      stopCamera();

      // ✅ Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(base64);

      // ✅ Send URL to App.tsx
      onCapture(imageUrl);
    } catch (err) {
      setError("❌ Capture failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 left-5 text-white text-xl"
      >
        ✖
      </button>

      {/* Error */}
      {error && (
        <p className="text-red-400 font-bold mb-4 text-center">{error}</p>
      )}

      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-2xl shadow-xl w-full max-w-md"
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Capture Button */}
      {cameraOn && (
        <button
          onClick={capturePhoto}
          disabled={loading}
          className="mt-6 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl"
        >
          {loading ? "Uploading..." : "📸 Capture & Identify"}
        </button>
      )}
    </div>
  );
};

export default CameraView;
