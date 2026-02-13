import React, { useEffect, useRef, useState } from "react";

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");

  /* ✅ Start Camera Automatically */
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  /* ✅ Start Camera */
  const startCamera = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

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

  /* ✅ Capture Photo */
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // ✅ Convert to Base64
      const base64 = canvas.toDataURL("image/jpeg", 0.8);

      stopCamera();

      // ✅ Send Base64 to App.tsx (API will handle Cloudinary + Grok)
      onCapture(base64);

      // ✅ Close Camera Screen
      onClose();
    } catch (err) {
      console.log(err);
      setError("❌ Capture failed. Please try again.");
    }
  };

  /* ✅ Upload from Gallery */
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;

      // ✅ Send Base64 directly
      onCapture(base64);

      // ✅ Close Camera Screen
      onClose();
    };

    reader.readAsDataURL(file);
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

      {/* Error */}
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

      {/* Buttons */}
      <div className="flex flex-col gap-4 mt-6 w-full max-w-md">
        {/* Capture Button */}
        {cameraOn && (
          <button
            onClick={capturePhoto}
            className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl"
          >
            📸 Capture & Identify
          </button>
        )}

        {/* Gallery Upload */}
        <label className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl text-center cursor-pointer">
          🖼 Upload from Gallery
          <input
            type="file"
            accept="image/*"
            onChange={handleGalleryUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default CameraView;
