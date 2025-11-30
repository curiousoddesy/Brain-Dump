import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Priority, Status } from '../types';
import { Archive, AlertCircle, Tag, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onArchive: (id: string) => void;
  isOverlay?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onArchive, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDone = task.status === Status.DONE;
  const [showDoneAnimation, setShowDoneAnimation] = useState(false);

  // Trigger visual pop when task enters DONE state
  useEffect(() => {
    if (isDone && !isOverlay) {
      setShowDoneAnimation(true);
      const timer = setTimeout(() => setShowDoneAnimation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isDone, isOverlay]);

  const priorityColors = {
    [Priority.HIGH]: 'bg-red-100 text-red-700 border-red-200',
    [Priority.MEDIUM]: 'bg-orange-100 text-orange-700 border-orange-200',
    [Priority.LOW]: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-indigo-50/50 p-4 rounded-xl border-2 border-dashed border-indigo-300 h-[140px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 active:scale-[0.98] relative 
        ${isOverlay 
          ? 'cursor-hand-grab rotate-2 scale-105 shadow-2xl ring-2 ring-indigo-500/20 border-indigo-500/40 z-50 !opacity-100' 
          : 'cursor-hand'
        }
        ${isDone 
            ? 'border-green-200/60 bg-green-50/20' 
            : 'border-gray-200/80'
        }
        ${showDoneAnimation ? 'scale-105 ring-4 ring-green-400/20 z-10' : ''}
      `}
    >
      {/* Visual completion indicator overlay on pop */}
      {showDoneAnimation && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl z-20 animate-pulse">
            <CheckCircle2 className="text-green-500 w-12 h-12 drop-shadow-sm" />
          </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${isDone ? 'opacity-50 grayscale' : priorityColors[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
        
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag start
            onArchive(task.id);
          }}
          className="text-gray-300 hover:text-indigo-500 transition-colors p-1 -mr-1 -mt-1 z-10"
          title="Archive Task"
        >
          <Archive size={16} />
        </button>
      </div>

      <h3 className={`font-semibold mb-1.5 text-sm leading-snug transition-all duration-300 ${isDone ? 'line-through text-gray-400 decoration-green-500/50' : 'text-gray-900'}`}>
        {task.title}
      </h3>
      
      <p className={`text-gray-500 text-xs line-clamp-3 mb-3 leading-relaxed ${isDone ? 'opacity-60' : ''}`}>
        {task.description}
      </p>

      {/* Dependencies and Blockers Section */}
      {(task.blockers?.length > 0 || task.dependencies?.length > 0) && (
        <div className={`mb-3 space-y-2 ${isDone ? 'opacity-40 grayscale' : ''}`}>
          {task.blockers?.map((b, idx) => (
             <div key={`blocker-${idx}`} className="flex items-start gap-1.5 text-xs text-red-700 bg-red-50 px-2 py-1.5 rounded-md border border-red-100/50">
               <ShieldAlert size={12} className="shrink-0 mt-0.5 text-red-500" />
               <span className="font-medium">{b}</span>
             </div>
          ))}
          {task.dependencies?.map((d, idx) => (
             <div key={`dep-${idx}`} className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded-md border border-amber-100/50">
               <Clock size={12} className="shrink-0 mt-0.5 text-amber-500" />
               <span>Waiting: {d}</span>
             </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-gray-50">
        <div className={`flex gap-1.5 flex-wrap ${isDone ? 'opacity-40' : ''}`}>
          {task.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="flex items-center text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
              <Tag size={9} className="mr-1 opacity-70" />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
             <span className="text-[10px] text-gray-400 pl-1">+{task.tags.length - 3}</span>
          )}
        </div>
        <div className="text-gray-300 shrink-0 pl-2">
           {task.status === 'Blocked' && !isDone && <AlertCircle size={16} className="text-amber-500" />}
           {isDone && <CheckCircle2 size={16} className="text-green-400" />}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;