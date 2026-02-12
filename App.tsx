
import React, { useState, useEffect } from 'react';
import { AppState, IdentificationRecord, FlowerDetails } from './types';
import CameraView from './components/CameraView';
import FlowerInfoOverlay from './components/FlowerInfoOverlay';
import HistoryView from './components/HistoryView';
import { identifyFlower } from './services/gemini';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppState>(AppState.HOME);
  const [history, setHistory] = useState<IdentificationRecord[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flower_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('flower_history', JSON.stringify(history));
  }, [history]);

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true);
    setCurrentView(AppState.HOME);
    setError(null);

    try {
      const details = await identifyFlower(imageData);
      const newRecord: IdentificationRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageData,
        details,
      };

      setHistory(prev => [newRecord, ...prev]);
      setActiveRecordId(newRecord.id);
      setCurrentView(AppState.RESULT);
    } catch (err) {
      setError("We couldn't identify this flower. Please try a clearer picture.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeRecordId === id) setActiveRecordId(null);
  };

  const updateRecordDetails = (newDetails: FlowerDetails) => {
    if (!activeRecordId) return;
    setHistory(prev => prev.map(rec => 
      rec.id === activeRecordId ? { ...rec, details: newDetails } : rec
    ));
  };

  const clearHistory = () => {
    if (window.confirm("Delete all identification history?")) {
      setHistory([]);
      setActiveRecordId(null);
    }
  };

  const activeRecord = history.find(r => r.id === activeRecordId);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-stone-50 border-x border-stone-200 shadow-2xl relative">
      {/* App Bar */}
      <header className="p-6 bg-white border-b border-stone-100 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-emerald-200 shadow-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Trova Fiori
          </h1>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">iniyan.talkies Assistant</p>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-stone-300 hover:text-red-400 transition-colors p-2"
            title="Clear all history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <div className="px-6 pt-8">
           <div className="mb-8">
             <h2 className="text-stone-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">Your Garden Explorations</h2>
             <HistoryView 
                records={history} 
                onSelect={(rec) => {
                  setActiveRecordId(rec.id);
                  setCurrentView(AppState.RESULT);
                }} 
                onDelete={handleDeleteRecord}
             />
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-stone-100 bg-white">
        <p className="text-[10px] text-stone-300 font-bold uppercase tracking-[0.3em]">
          Powered by iniyan.talkies
        </p>
      </footer>

      {/* Processing State */}
      {isProcessing && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-10">
           <div className="bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-stone-800">Identifying...</h3>
              <p className="text-stone-500 mt-2">Checking with our botanical expert AI</p>
           </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-24 left-6 right-6 bg-red-500 text-white p-4 rounded-2xl shadow-xl z-[90] flex items-center justify-between animate-bounce">
          <p className="font-medium text-sm">{error}</p>
          <button onClick={() => setError(null)} className="p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Fixed Primary Button */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setCurrentView(AppState.CAMERA)}
          className="group bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-8 py-4 rounded-full shadow-2xl shadow-emerald-200 flex items-center gap-3 transition-all duration-300"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">Identify Flower</span>
        </button>
      </div>

      {/* Overlay Views */}
      {currentView === AppState.CAMERA && (
        <CameraView
          onCapture={handleCapture}
          onClose={() => setCurrentView(AppState.HOME)}
        />
      )}

      {currentView === AppState.RESULT && activeRecord && (
        <FlowerInfoOverlay
          details={activeRecord.details}
          image={activeRecord.imageData}
          onClose={() => setCurrentView(AppState.HOME)}
          onUpdateDetails={updateRecordDetails}
        />
      )}
    </div>
  );
};

export default App;
