import React, { useRef, useState } from "react";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // ✅ Start Camera
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
    } catch (err) {
      alert("Camera access denied or not supported.");
    }
  }

  // ✅ Capture Image + Send to Grok API
  async function captureFlower() {
    if (!videoRef.current) return;

    setLoading(true);
    setResult("");

    // Create Canvas
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);

    // Convert to Base64
    const imageBase64 = canvas.toDataURL("image/jpeg");

    try {
      // Send to API Route
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();

      if (data.result) {
        setResult(data.result);
      } else {
        setResult("❌ No response from Grok AI.");
      }
    } catch (error) {
      setResult("❌ Error connecting to Grok API.");
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-green-700 mb-2">
        🌸 Trova Fiori
      </h1>
      <p className="text-gray-500 mb-6">Flower Identifier Assistant</p>

      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-xl shadow-md w-full max-w-sm mb-4"
      />

      {/* Buttons */}
      {!cameraOn ? (
        <button
          onClick={startCamera}
          className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold"
        >
          📷 Open Camera
        </button>
      ) : (
        <button
          onClick={captureFlower}
          className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold"
        >
          🌸 Capture & Identify
        </button>
      )}

      {/* Loading */}
      {loading && (
        <p className="mt-4 text-orange-600 font-semibold">
          Identifying flower... please wait 🌼
        </p>
      )}

      {/* Result Output */}
      {result && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-md w-full max-w-lg">
          <h2 className="text-lg font-bold mb-2 text-green-700">
            Flower Details
          </h2>
          <pre className="whitespace-pre-wrap text-gray-800 text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
