import React, { useState, useEffect } from "react";
import { AppState, IdentificationRecord } from "./types";
import CameraView from "./components/CameraView";
import FlowerInfoOverlay from "./components/FlowerInfoOverlay";
import HistoryView from "./components/HistoryView";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppState>(AppState.HOME);
  const [history, setHistory] = useState<IdentificationRecord[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ✅ Load history */
  useEffect(() => {
    const saved = localStorage.getItem("flower_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        console.error("Failed to parse history");
      }
    }
  }, []);

  /* ✅ Save history */
  useEffect(() => {
    localStorage.setItem("flower_history", JSON.stringify(history));
  }, [history]);

  /* ✅ NEW Capture Handler (Uses API Identify Route) */
  const handleCapture = async (base64Image: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // ✅ Call backend API (Cloudinary + Grok)
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Image,
        }),
      });

      const data = await res.json();

      if (!data.result) throw new Error("No response");

      // ✅ Create new history record
      const newRecord: IdentificationRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageData: data.uploadedImage, // Cloudinary URL
        details: {
          description: data.result, // Store Grok response
        } as any,
      };

      setHistory((prev) => [newRecord, ...prev]);
      setActiveRecordId(newRecord.id);
      setCurrentView(AppState.RESULT);
    } catch (err) {
      console.log(err);
      setError("❌ Flower identification failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ✅ Delete Record */
  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeRecordId === id) setActiveRecordId(null);
  };

  /* ✅ Clear History */
  const clearHistory = () => {
    if (window.confirm("Delete all identification history?")) {
      setHistory([]);
      setActiveRecordId(null);
    }
  };

  const activeRecord = history.find((r) => r.id === activeRecordId);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-stone-50 border-x border-stone-200 shadow-2xl relative">
      {/* Header */}
      <header className="p-6 bg-white border-b border-stone-100 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight">
            🌸 Trova Fiori
          </h1>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
            Flower Identifier AI
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-stone-300 hover:text-red-400 transition-colors p-2"
            title="Clear all history"
          >
            🗑
          </button>
        )}
      </header>

      {/* History */}
      <main className="flex-1 pb-24 overflow-y-auto px-6 pt-8">
        <HistoryView
          records={history}
          onSelect={(rec) => {
            setActiveRecordId(rec.id);
            setCurrentView(AppState.RESULT);
          }}
          onDelete={handleDeleteRecord}
        />
      </main>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-3xl shadow-xl text-center">
            <h3 className="text-lg font-bold">Identifying Flower...</h3>
            <p className="text-stone-500 mt-2">Please wait 🌼</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-24 left-6 right-6 bg-red-500 text-white p-4 rounded-2xl shadow-xl z-[90]">
          {error}
        </div>
      )}

      {/* Identify Button */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setCurrentView(AppState.CAMERA)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full shadow-xl font-bold"
        >
          📸 Identify Flower
        </button>
      </div>

      {/* Camera Overlay */}
      {currentView === AppState.CAMERA && (
        <CameraView
          onCapture={handleCapture}
          onClose={() => setCurrentView(AppState.HOME)}
        />
      )}

      {/* Result Overlay */}
      {currentView === AppState.RESULT && activeRecord && (
        <FlowerInfoOverlay
          details={activeRecord.details}
          image={activeRecord.imageData}
          onClose={() => setCurrentView(AppState.HOME)}
          onUpdateDetails={() => {}}
        />
      )}
    </div>
  );
};

export default App;
