
import React, { useState } from 'react';
import { FlowerDetails } from '../types';
import { translateDetailsToTamil } from '../services/gemini';

interface FlowerInfoOverlayProps {
  details: FlowerDetails;
  image: string;
  onClose: () => void;
  onUpdateDetails: (details: FlowerDetails) => void;
}

const FlowerInfoOverlay: React.FC<FlowerInfoOverlayProps> = ({ details, image, onClose, onUpdateDetails }) => {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (details.tamil) return;
    setIsTranslating(true);
    try {
      const tamilData = await translateDetailsToTamil(details);
      onUpdateDetails({
        ...details,
        tamil: tamilData
      });
    } catch (err) {
      alert("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white pb-20 animate-in slide-in-from-bottom duration-300">
      {/* Action Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-3 flex justify-between items-center border-b border-stone-100">
        <button 
          onClick={onClose}
          className="p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em]">Flower Details</span>
        {!details.tamil ? (
          <button 
            onClick={handleTranslate}
            disabled={isTranslating}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              isTranslating ? 'bg-stone-100 text-stone-400' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
            }`}
          >
            {isTranslating ? (
              <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            )}
            Tamil Translate
          </button>
        ) : (
          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
            TAMIL ADDED
          </div>
        )}
      </div>

      <div className="px-6 md:px-12 max-w-2xl mx-auto py-8">
        {/* Title Section */}
        <div className="mb-8 border-b border-stone-100 pb-6">
          <h1 className="text-4xl font-bold text-stone-900 leading-tight font-serif mb-1">
            {details.commonName}
          </h1>
          {details.tamil && (
            <h2 className="text-2xl font-bold text-emerald-700 leading-tight mb-2">
              {details.tamil.commonName}
            </h2>
          )}
          <p className="text-emerald-600 font-medium italic text-base">
            {details.scientificName}
          </p>
        </div>

        {/* Info Grid */}
        <div className="space-y-6 mb-10 text-[17px] leading-relaxed text-stone-800">
          <div>
            <p className="mb-1">
              <span className="font-bold text-stone-900">Basic Information:</span> {details.description}
            </p>
            {details.tamil && (
              <p className="text-stone-600 bg-stone-50 p-3 rounded-xl text-[16px] border-l-4 border-emerald-200 mt-2">
                <span className="font-bold text-stone-800">அடிப்படை தகவல்:</span> {details.tamil.description}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1">
              <span className="font-bold text-stone-900">Sun:</span> {details.sun}
            </p>
            {details.tamil && (
              <p className="text-stone-600 bg-stone-50 p-3 rounded-xl text-[16px] border-l-4 border-emerald-200 mt-2">
                <span className="font-bold text-stone-800">சூரிய ஒளி:</span> {details.tamil.sun}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1">
              <span className="font-bold text-stone-900">Soil Needs:</span> {details.soilNeeds}
            </p>
            {details.tamil && (
              <p className="text-stone-600 bg-stone-50 p-3 rounded-xl text-[16px] border-l-4 border-emerald-200 mt-2">
                <span className="font-bold text-stone-800">மண் தேவை:</span> {details.tamil.soilNeeds}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1">
              <span className="font-bold text-stone-900">Blooms In:</span> {details.bloomsIn}
            </p>
            {details.tamil && (
              <p className="text-stone-600 bg-stone-50 p-3 rounded-xl text-[16px] border-l-4 border-emerald-200 mt-2">
                <span className="font-bold text-stone-800">பூக்கும் காலம்:</span> {details.tamil.bloomsIn}
              </p>
            )}
          </div>

          {/* New Field: Natural Habitat */}
          <div>
            <p className="mb-1">
              <span className="font-bold text-stone-900">Natural Habitat (Country/Region):</span> {details.naturalHabitat}
            </p>
            {details.tamil && (
              <p className="text-stone-600 bg-stone-50 p-3 rounded-xl text-[16px] border-l-4 border-emerald-200 mt-2">
                <span className="font-bold text-stone-800">இயற்கை வாழிடம் (நாடு / பகுதி):</span> {details.tamil.naturalHabitat}
              </p>
            )}
          </div>

          {/* New Field: Flower Type */}
          <div>
            <p className="mb-1">
              <span className="font-bold text-stone-900">Flower Type:</span> {details.flowerType}
            </p>
            {details.tamil && (
              <p className="text-stone-600 bg-stone-50 p-3 rounded-xl text-[16px] border-l-4 border-emerald-200 mt-2">
                <span className="font-bold text-stone-800">பூவின் வகை:</span> {details.tamil.flowerType}
              </p>
            )}
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-[32px] overflow-hidden shadow-2xl border border-stone-100 mb-10 ring-8 ring-stone-50">
          <img 
            src={image} 
            alt={details.commonName} 
            className="w-full h-auto object-cover max-h-[600px] hover:scale-105 transition-transform duration-700" 
          />
        </div>

        {/* Additional Trivia Section */}
        <div className="p-8 bg-stone-900 rounded-[32px] text-white relative overflow-hidden shadow-xl">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full"></div>
           <div className="flex items-center gap-2 mb-4 text-emerald-400 uppercase tracking-widest text-[11px] font-bold">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
             Did you know? / உங்களுக்கு தெரியுமா?
           </div>
           <p className="text-stone-200 italic text-lg leading-relaxed mb-4">
             {details.funFact}
           </p>
           {details.tamil && (
             <p className="text-emerald-100 italic text-lg leading-relaxed pt-4 border-t border-white/10">
               {details.tamil.funFact}
             </p>
           )}
        </div>
      </div>
    </div>
  );
};

export default FlowerInfoOverlay;
