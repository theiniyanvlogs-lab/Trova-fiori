import React from "react";

interface FlowerInfoOverlayProps {
  details: any;
  image: string;
  onClose: () => void;
  onUpdateDetails: (details: any) => void;
}

const FlowerInfoOverlay: React.FC<FlowerInfoOverlayProps> = ({
  details,
  image,
  onClose,
}) => {
  // ✅ Grok gives response as plain text stored inside description
  const textResult =
    details?.description || "No flower details received.";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white pb-20 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-3 flex justify-between items-center border-b border-stone-100">
        <button
          onClick={onClose}
          className="p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
        >
          ⬅ Back
        </button>

        <span className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em]">
          Flower Details
        </span>

        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
          GROK AI
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 max-w-2xl mx-auto py-8">
        {/* Image */}
        <div className="rounded-[32px] overflow-hidden shadow-2xl border border-stone-100 mb-8 ring-8 ring-stone-50">
          <img
            src={image}
            alt="Flower"
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>

        {/* Result Text */}
        <div className="p-6 bg-stone-50 rounded-[28px] shadow-md border border-stone-200">
          <h2 className="text-xl font-bold text-emerald-700 mb-4">
            🌸 Identification Result
          </h2>

          <pre className="whitespace-pre-wrap text-stone-800 text-[16px] leading-relaxed font-medium">
            {textResult}
          </pre>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-stone-400 text-xs">
          Powered by Cloudinary + Grok Vision AI
        </div>
      </div>
    </div>
  );
};

export default FlowerInfoOverlay;
