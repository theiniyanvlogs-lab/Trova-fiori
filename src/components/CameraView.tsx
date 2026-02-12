import React, { useEffect, useRef, useState } from "react";

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Start Camera on Load
  useEffect(() => {
    startCamera();

    // ✅ Cleanup when closing component
    return () => stopCamera();
  }, []);

  // ✅ Start Camera Function
  const startCamera = async () => {
    try {
      setLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // ✅ iPhone Fix: Wait for video metadata
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraOn(true);
          setLoading(false);
        };
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setError("❌ Camera access denied or not supported on this device.");
      setLoading(false);
    }
  };

  // ✅ Stop Camera Function
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setCameraOn(false);
  };

  // ✅ Capture Photo Function
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // ✅ Convert to Base64 Image
    const imageData = canvas.toDataURL("image/jpeg");

    // ✅ Stop Camera after Capture
    stopCamera();

    // ✅ Send Image to App.tsx
    onCapture(imageData);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">

      {/* ❌ Close Button */}
      <button
        onClick={() => {
          stopCamera();
          onClose();
        }}
        className="absolute top-5 left-5 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full font-bold"
      >
        ✖ Close
      </button>

      {/* ✅ Loading */}
      {loading && (
        <p className="text-white text-lg font-bold mb-4 animate-pulse">
          📷 Opening Camera...
        </p>
      )}

      {/* ❌ Error Message */}
      {error && (
        <p className="text-red-400 font-bold mb-4 text-center">{error}</p>
      )}

      {/* ✅ Camera Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-3xl shadow-2xl w-full max-w-md border-4 border-white/10"
      />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ✅ Capture Button */}
      {cameraOn && (
        <button
          onClick={capturePhoto}
          className="mt-8 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl flex items-center gap-2"
        >
          📸 Capture & Identify Flower
        </button>
      )}
    </div>
  );
};

export default CameraView;
