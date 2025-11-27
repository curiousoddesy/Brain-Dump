import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, Loader2, Lightbulb, Zap, CornerDownLeft } from 'lucide-react';

interface AIInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
  isProcessing: boolean;
}

const AIInputModal: React.FC<AIInputModalProps> = ({ isOpen, onClose, onSubmit, isProcessing }) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };

  const insertTemplate = (text: string) => {
    setInput(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/30 backdrop-blur-sm">
      {/* 
        Modal Container 
        - Mobile: Full width/height (h-[90vh])
        - Desktop: Max width increased to 5xl for 2-column layout
      */}
      <div className="bg-white w-full h-[95vh] sm:h-[85vh] lg:max-w-5xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles size={20} />
            <span className="font-semibold text-sm text-gray-700">Brain Dump AI</span>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content Area - Flex Row on Desktop */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT COLUMN: Input Area */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Brain Dump
            </label>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Describe the task, the blocker, or paste the email content here.
            </p>
            <textarea
              className="flex-1 w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none outline-none text-base sm:text-lg leading-relaxed"
              placeholder="Type here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
             {/* Mobile Footer embedded in left col for flow, desktop logic handled in wrapper if needed, 
                 but keeping the footer separate at bottom is cleaner. See Footer section below. */}
          </div>

          {/* RIGHT COLUMN: Suggestions & Guide (Hidden on Mobile) */}
          <div className="hidden lg:flex w-80 bg-gray-50/50 border-l border-gray-100 flex-col p-6 overflow-y-auto gap-6">
            
            {/* Smart Tips */}
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-gray-700 text-sm mb-3">
                <Lightbulb size={16} className="text-amber-500" />
                Smart Parsing Tips
              </h4>
              <ul className="space-y-3 text-xs text-gray-500 leading-relaxed">
                <li className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                  <strong className="text-indigo-600 font-medium">Dependencies:</strong> 
                  <br/>Use words like "waiting for", "depends on", or "after".
                </li>
                <li className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                  <strong className="text-red-500 font-medium">Blockers:</strong> 
                  <br/>Mention "blocked by", "stuck on", or "server down".
                </li>
                <li className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                  <strong className="text-gray-700 font-medium">Priority:</strong> 
                  <br/>Keywords like "urgent", "ASAP", or "low priority" set the level automatically.
                </li>
              </ul>
            </div>

            {/* Quick Starters */}
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-gray-700 text-sm mb-3">
                <Zap size={16} className="text-indigo-500" />
                Quick Starters
              </h4>
              <div className="space-y-2">
                <button 
                  onClick={() => insertTemplate("Review the Q3 marketing report sent by Sarah, but I'm waiting on the final numbers from Finance.")}
                  className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-xs text-gray-600 group"
                >
                  <span className="font-medium text-gray-800 block mb-1">Dependency Example</span>
                  "Waiting on final numbers..."
                  <ArrowRight size={12} className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                </button>

                <button 
                  onClick={() => insertTemplate("URGENT: The payment gateway API is returning 500 errors. We need to fix this immediately.")}
                  className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:shadow-md transition-all text-xs text-gray-600 group"
                >
                  <span className="font-medium text-gray-800 block mb-1">High Priority Blocker</span>
                  "API returning 500 errors..."
                  <ArrowRight size={12} className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center gap-3 shrink-0 pb-8 sm:pb-4 z-10">
            <div className="flex items-center gap-2 text-xs text-gray-400 hidden sm:flex">
                <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200 font-mono">CMD + Enter</span>
                <span>to submit</span>
            </div>
            
            {/* Spacer for mobile layout balance */}
            <span className="sm:hidden"></span> 
            
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-white text-sm shadow-lg transition-all w-full sm:w-auto
              ${!input.trim() || isProcessing 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-black hover:bg-gray-800 active:scale-95'}`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Create Task
                <CornerDownLeft size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInputModal;