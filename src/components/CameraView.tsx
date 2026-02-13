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

  /* ✅ Start Camera (Mobile Safe) */
  const startCamera = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // ✅ Wait for video metadata before playing
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play();
          setCameraOn(true);
        };
      }
    } catch (err) {
      console.log(err);
      setError("❌ Camera not supported or permission denied.");
    }
  };

  /* ✅ Stop Camera */
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
  };

  /* ✅ Capture + Upload + Identify (Fixed) */
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    setError("");

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // ✅ Ensure video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Camera not ready yet");
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");

      // ✅ Draw image frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // ✅ Convert to Base64 (Better Quality + Smaller Size)
      const base64 = canvas.toDataURL("image/jpeg", 0.8);

      // ✅ Stop camera after capture
      stopCamera();

      // ✅ Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(base64);

      // ✅ Return uploaded image URL
      onCapture(imageUrl);
    } catch (err) {
      console.log(err);
      setError("❌ Capture failed. Please try again slowly.");
      startCamera(); // ✅ Restart camera automatically
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={() => {
          stopCamera();
          onClose();
        }}
        className="absolute top-5 left-5 text-white text-xl"
      >
        ✖
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 font-bold mb-4 text-center">{error}</p>
      )}

      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
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
