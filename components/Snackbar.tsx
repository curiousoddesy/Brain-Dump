import React from 'react';
import { RotateCcw, X } from 'lucide-react';

interface SnackbarProps {
  message: string;
  isVisible: boolean;
  onUndo: () => void;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, isVisible, onUndo, onClose }) => {
  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 pl-4 pr-3 py-3 bg-gray-900/90 backdrop-blur-md text-white rounded-full shadow-2xl border border-white/10 transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      }`}
    >
      <span className="text-sm font-medium text-gray-100">{message}</span>
      
      <div className="w-px h-4 bg-gray-700"></div>
      
      <button
        onClick={onUndo}
        className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1.5 transition-colors"
      >
        <RotateCcw size={16} />
        Undo
      </button>
      
      <button
        onClick={onClose}
        className="p-1 text-gray-500 hover:text-gray-300 hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Snackbar;