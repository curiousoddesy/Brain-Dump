
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import { Task, Status } from '../types';
import ArchiveBoxIcon from './ArchiveBoxIcon';

interface ColumnProps {
  id: Status;
  title: string;
  tasks: Task[];
  onArchiveTask: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onClearColumn?: () => void;
}

const Column: React.FC<ColumnProps> = ({ id, title, tasks, onArchiveTask, onStatusChange, onClearColumn }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const taskIds = tasks.map(t => t.id);

  const getHeaderColor = () => {
    switch (id) {
      case Status.BLOCKED: return 'text-amber-700';
      case Status.DONE: return 'text-green-700';
      case Status.IN_PROGRESS: return 'text-blue-700';
      default: return 'text-gray-700';
    }
  }

  const getBgColor = () => {
    switch (id) {
      case Status.TODO: return 'bg-gray-100/70';
      case Status.IN_PROGRESS: return 'bg-blue-50/60';
      case Status.BLOCKED: return 'bg-amber-50/60';
      case Status.DONE: return 'bg-green-50/60';
      default: return 'bg-gray-100/50';
    }
  };

  return (
    /* 
      Responsive Layout:
      Mobile: w-full, h-auto (stacks vertically)
      Laptop (md): flex-1 width, auto height (grows with content)
    */
    <div className="flex flex-col shrink-0 w-full md:flex-1 md:min-w-[280px] md:max-w-[400px] transition-all duration-300">
      <div className={`flex items-center justify-between mb-3 px-2 shrink-0`}>
        <h2 className={`font-semibold text-sm tracking-wide flex items-center gap-2 ${getHeaderColor()}`}>
          <span className={`w-2 h-2 rounded-full shadow-sm ${id === Status.BLOCKED ? 'bg-amber-500' :
              id === Status.DONE ? 'bg-green-500' :
                id === Status.IN_PROGRESS ? 'bg-blue-500' : 'bg-gray-400'
            }`}></span>
          {title}
        </h2>

        <div className="flex items-center gap-2">
          {onClearColumn && tasks.length > 0 && (
            <button
              onClick={onClearColumn}
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors border border-indigo-100"
              title="Archive All"
            >
              <ArchiveBoxIcon size={10} />
              Archive All
            </button>
          )}
          <span className="text-xs font-medium text-gray-500 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* 
        Task List Container:
        Auto height - grows with content
      */}
      <div
        ref={setNodeRef}
        className={`rounded-2xl p-2.5 space-y-3 backdrop-blur-sm shadow-inner transition-all duration-200 min-h-[100px] 
          ${isOver
            ? 'bg-indigo-50/90 border-2 border-dashed border-indigo-400/60 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]'
            : `${getBgColor()} border border-white/50`
          }
        `}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onArchive={onArchiveTask} onStatusChange={onStatusChange} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <div className="h-24 md:h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-300/50 rounded-xl m-1">
            Empty
          </div>
        )}

        {tasks.length === 0 && isOver && (
          <div className="h-24 md:h-32 flex items-center justify-center text-indigo-400 text-sm border-2 border-dashed border-indigo-300/50 rounded-xl m-1 bg-indigo-50/50">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
