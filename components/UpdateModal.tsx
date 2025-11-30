import React from 'react';
import { Sparkles, X, RefreshCw } from 'lucide-react';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  changes: string[];
}

const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, version, changes }) => {
  if (!isOpen) return null;

  const handleRestart = () => {
    // Clear caches and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg">New Update Available!</h2>
                <p className="text-white/80 text-sm">Version {version}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <h3 className="font-semibold text-gray-900 mb-3">What's New:</h3>
          <ul className="space-y-2 mb-6">
            {changes.map((change, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-indigo-500 mt-1">•</span>
                <span>{change}</span>
              </li>
            ))}
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-amber-800">
              <strong>To apply this update:</strong> Close the app completely from your recent apps and reopen it.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleRestart}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
