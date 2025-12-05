import React, { useEffect, useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Priority, Status } from '../types';
import { AlertCircle, Tag, Clock, ShieldAlert, CheckCircle2, Play, Ban, Check } from 'lucide-react';
import ArchiveBoxIcon from './ArchiveBoxIcon';

interface TaskCardProps {
  task: Task;
  onArchive: (id: string) => void;
  onStatusChange?: (id: string, status: Status) => void;
  isOverlay?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onArchive, onStatusChange, isOverlay }) => {
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
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
    };
    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showContextMenu]);

  // Trigger visual pop when task enters DONE state
  useEffect(() => {
    if (isDone && !isOverlay) {
      setShowDoneAnimation(true);
      const timer = setTimeout(() => setShowDoneAnimation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isDone, isOverlay]);


  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setShowContextMenu(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      }
      setShowContextMenu(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleStatusChange = (newStatus: Status) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
    setShowContextMenu(false);
  };

  const priorityColors = {
    [Priority.HIGH]: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    [Priority.MEDIUM]: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    [Priority.LOW]: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-indigo-50/50 dark:bg-indigo-900/30 p-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 h-[140px]"
      />
    );
  }

  const menuItems = [
    { status: Status.IN_PROGRESS, label: 'Move to In Progress', icon: Play, color: 'text-blue-600 dark:text-blue-400', bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/50' },
    { status: Status.BLOCKED, label: 'Move to Blocked', icon: Ban, color: 'text-amber-600 dark:text-amber-400', bg: 'hover:bg-amber-50 dark:hover:bg-amber-900/50' },
    { status: Status.DONE, label: 'Move to Done', icon: Check, color: 'text-green-600 dark:text-green-400', bg: 'hover:bg-green-50 dark:hover:bg-green-900/50' },
  ].filter(item => item.status !== task.status);


  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={style}
      {...attributes}
      {...listeners}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={`group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 active:scale-[0.98] relative 
        ${isOverlay 
          ? 'cursor-hand-grab rotate-2 scale-105 shadow-2xl ring-2 ring-indigo-500/20 border-indigo-500/40 z-50 !opacity-100' 
          : 'cursor-hand'
        }
        ${isDone 
            ? 'border-green-200/60 dark:border-green-800/60 bg-green-50/20 dark:bg-green-900/20' 
            : 'border-gray-200/80 dark:border-gray-700/80'
        }
        ${showDoneAnimation ? 'scale-105 ring-4 ring-green-400/20 z-10' : ''}
      `}
    >
      {/* Context Menu */}
      {showContextMenu && (
        <div 
          className="absolute z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-150"
          style={{ 
            left: Math.min(menuPosition.x, 100), 
            top: menuPosition.y,
            transform: 'translateY(-50%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item) => (
            <button
              key={item.status}
              onClick={() => handleStatusChange(item.status)}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${item.color} ${item.bg} transition-colors`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button
            onClick={() => {
              onArchive(task.id);
              setShowContextMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
          >
            <ArchiveBoxIcon size={16} />
            Archive
          </button>
        </div>
      )}

      {/* Visual completion indicator overlay on pop */}
      {showDoneAnimation && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-[1px] rounded-xl z-20 animate-pulse">
            <CheckCircle2 className="text-green-500 w-12 h-12 drop-shadow-sm" />
          </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${isDone ? 'opacity-50 grayscale' : priorityColors[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onArchive(task.id);
          }}
          className="text-gray-300 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1 -mr-1 -mt-1 z-10"
          title="Archive Task"
        >
          <ArchiveBoxIcon size={16} />
        </button>
      </div>

      <h3 className={`font-semibold mb-1.5 text-sm leading-snug transition-all duration-300 ${isDone ? 'line-through text-gray-400 dark:text-gray-500 decoration-green-500/50' : 'text-gray-900 dark:text-gray-100'}`}>
        {task.title}
      </h3>
      
      <p className={`text-gray-500 dark:text-gray-400 text-xs line-clamp-3 mb-3 leading-relaxed ${isDone ? 'opacity-60' : ''}`}>
        {task.description}
      </p>


      {/* Dependencies and Blockers Section */}
      {(task.blockers?.length > 0 || task.dependencies?.length > 0) && (
        <div className={`mb-3 space-y-2 ${isDone ? 'opacity-40 grayscale' : ''}`}>
          {task.blockers?.map((b, idx) => (
             <div key={`blocker-${idx}`} className="flex items-start gap-1.5 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1.5 rounded-md border border-red-100/50 dark:border-red-800/50">
               <ShieldAlert size={12} className="shrink-0 mt-0.5 text-red-500" />
               <span className="font-medium">{b}</span>
             </div>
          ))}
          {task.dependencies?.map((d, idx) => (
             <div key={`dep-${idx}`} className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1.5 rounded-md border border-amber-100/50 dark:border-amber-800/50">
               <Clock size={12} className="shrink-0 mt-0.5 text-amber-500" />
               <span>Waiting: {d}</span>
             </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-gray-50 dark:border-gray-700">
        <div className={`flex gap-1.5 flex-wrap ${isDone ? 'opacity-40' : ''}`}>
          {task.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="flex items-center text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-md">
              <Tag size={9} className="mr-1 opacity-70" />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
             <span className="text-[10px] text-gray-400 dark:text-gray-500 pl-1">+{task.tags.length - 3}</span>
          )}
        </div>
        <div className="text-gray-300 dark:text-gray-600 shrink-0 pl-2">
           {task.status === 'Blocked' && !isDone && <AlertCircle size={16} className="text-amber-500" />}
           {isDone && <CheckCircle2 size={16} className="text-green-400" />}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
