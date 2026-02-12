
import React from 'react';
import { IdentificationRecord } from '../types';

interface HistoryViewProps {
  records: IdentificationRecord[];
  onSelect: (record: IdentificationRecord) => void;
  onDelete: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ records, onSelect, onDelete }) => {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center opacity-50">
        <div className="w-24 h-24 mb-4 text-emerald-200">
           <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        <p className="text-xl font-medium text-stone-500">No flowers identified yet.</p>
        <p className="text-stone-400 mt-1">Snap a picture to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {records.map((record) => (
        <div
          key={record.id}
          className="relative group"
        >
          <button
            onClick={() => onSelect(record)}
            className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 text-left hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="h-40 relative">
              <img src={record.imageData} className="w-full h-full object-cover" alt={record.details.commonName} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-2 left-3">
                <p className="text-white text-xs opacity-75">
                  {new Date(record.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="p-3">
              <p className="font-bold text-stone-800 line-clamp-1">{record.details.commonName}</p>
              <p className="text-emerald-600 text-xs italic">{record.details.scientificName}</p>
            </div>
          </button>
          
          {/* Individual Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
            className="absolute top-2 right-2 p-2 bg-black/30 hover:bg-red-500 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
            title="Delete this record"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default HistoryView;
