import React from 'react';
import { X, RefreshCw, Trash2, Archive } from 'lucide-react';
import { Task } from '../types';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedTasks: Task[];
  onRestore: (id: string) => void;
  onDeleteForever: (id: string) => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  archivedTasks,
  onRestore,
  onDeleteForever
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80 shrink-0">
            <div className="flex items-center gap-2 text-gray-800">
                <Archive size={20} className="text-indigo-600"/>
                <h2 className="font-semibold">Archived Tasks</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
            {archivedTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                    <Archive size={48} className="opacity-20" />
                    <p>No archived tasks</p>
                </div>
            ) : (
                archivedTasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 group hover:shadow-md transition-all">
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                             <p className="text-xs text-gray-500 line-clamp-1 mb-2">{task.description}</p>
                            <div className="flex gap-2 text-[10px]">
                                <span className={`px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200`}>
                                    {task.status}
                                </span>
                                <span className="text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                            <button 
                                onClick={() => onRestore(task.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                title="Restore to Board"
                            >
                                <RefreshCw size={14} />
                                Restore
                            </button>
                            <button 
                                onClick={() => onDeleteForever(task.id)}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Forever"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;