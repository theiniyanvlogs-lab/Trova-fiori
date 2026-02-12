
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsLoading(false);
      }
    } catch (err) {
      setError("Unable to access camera. Please ensure permissions are granted.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 rounded-full backdrop-blur-md text-white border border-white/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-white font-medium text-sm tracking-wide bg-emerald-600/80 px-3 py-1 rounded-full backdrop-blur-md">
          ALIGN FLOWER IN CENTER
        </span>
        <div className="w-10"></div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-white flex-col gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p>Initializing Lens...</p>
          </div>
        )}
        {error && (
          <div className="p-8 text-center text-white">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-2 bg-emerald-600 rounded-lg"
            >
              Retry
            </button>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        />
        
        {/* Viewfinder Guide */}
        <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none flex items-center justify-center">
           <div className="w-64 h-64 border-2 border-white/40 rounded-3xl relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>
           </div>
        </div>
      </div>

      {/* Capture Button Container */}
      <div className="bg-stone-900 p-8 flex justify-center items-center">
        <button
          onClick={captureFrame}
          disabled={isLoading || !!error}
          className="relative flex items-center justify-center group"
        >
          <div className="absolute w-20 h-20 border-4 border-white/20 rounded-full group-active:scale-95 transition-transform"></div>
          <div className="w-16 h-16 bg-white rounded-full border-4 border-stone-900 group-active:scale-90 transition-transform shadow-lg"></div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
