
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, BrainCircuit, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';

import Column from './components/Column';
import TaskCard from './components/TaskCard';
import AIInputModal from './components/AIInputModal';
import Snackbar from './components/Snackbar';
import ConfirmationModal from './components/ConfirmationModal';
import ArchiveModal from './components/ArchiveModal';
import UpdateModal from './components/UpdateModal';
import Logo from './components/Logo';
import UserMenu from './components/UserMenu';
import { parseTaskFromInput } from './services/geminiService';
import { APP_VERSION, CHANGELOG } from './version';
import { 
  signInWithGoogle, 
  signOut, 
  onAuthChange, 
  saveUserData, 
  getUserData,
  subscribeToUserData 
} from './services/firebase';
import { Task, Status, ColumnType, Priority } from './types';

const COLUMNS: ColumnType[] = [
  { id: Status.TODO, title: 'To Do' },
  { id: Status.IN_PROGRESS, title: 'In Progress' },
  { id: Status.BLOCKED, title: 'Blocked' },
  { id: Status.DONE, title: 'Done' },
];

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Welcome to Brain Dump',
    description: 'This is a sample task. Long press to drag me on mobile!',
    priority: Priority.LOW,
    status: Status.TODO,
    tags: ['Onboarding'],
    dependencies: [],
    blockers: [],
    createdAt: new Date().toISOString(),
    isArchived: false
  }
];

const STORAGE_KEY = 'braindump-data';
const LEGACY_STORAGE_KEY = 'zentask-data';

// Helper to ensure task structure is valid when loading from storage
const migrateTask = (t: any): Task => ({
  id: t.id || crypto.randomUUID(),
  title: t.title || 'Untitled Task',
  description: t.description || '',
  priority: Object.values(Priority).includes(t.priority) ? t.priority : Priority.MEDIUM,
  status: Object.values(Status).includes(t.status) ? t.status : Status.TODO,
  tags: Array.isArray(t.tags) ? t.tags : [],
  dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
  blockers: Array.isArray(t.blockers) ? t.blockers : [],
  createdAt: t.createdAt || new Date().toISOString(),
  isArchived: !!t.isArchived
});

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      // 1. Try loading from the new key
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(migrateTask);
        }
      }

      // 2. If not found, check for legacy key (Migration Step)
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          console.log("Migrating data from ZenTask to Brain Dump...");
          return parsedLegacy.map(migrateTask);
        }
      }
    } catch (e) {
      console.error("Failed to load tasks from storage", e);
    }

    // 3. Fallback to initial state if absolutely no data found
    return INITIAL_TASKS;
  });
  
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track the status where the drag started to trigger confetti only on meaningful changes
  const [dragStartStatus, setDragStartStatus] = useState<Status | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearDoneModalOpen, setIsClearDoneModalOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Check for app updates
  useEffect(() => {
    const LAST_VERSION_KEY = 'braindump-last-version';
    const lastVersion = localStorage.getItem(LAST_VERSION_KEY);
    
    if (lastVersion && lastVersion !== APP_VERSION) {
      // New version detected, show update modal
      setShowUpdateModal(true);
    }
    
    // Save current version
    localStorage.setItem(LAST_VERSION_KEY, APP_VERSION);
  }, []);

  // Undo state
  const [lastArchivedId, setLastArchivedId] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const isInitialLoad = useRef(true);
  const skipNextSync = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tasksRef = useRef(tasks);
  
  // Keep tasksRef in sync
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        // Load user data from Firebase
        setIsSyncing(true);
        try {
          const cloudTasks = await getUserData(authUser.uid);
          if (cloudTasks && cloudTasks.length > 0) {
            skipNextSync.current = true;
            setTasks(cloudTasks.map(migrateTask));
          } else {
            // First time user - upload local tasks using ref for current value
            await saveUserData(authUser.uid, tasksRef.current);
          }
          setLastSynced(new Date());
          
          // Subscribe to real-time updates
          if (unsubscribeRef.current) unsubscribeRef.current();
          unsubscribeRef.current = subscribeToUserData(authUser.uid, (cloudTasks) => {
            if (!isInitialLoad.current) {
              skipNextSync.current = true;
              setTasks(cloudTasks.map(migrateTask));
              setLastSynced(new Date());
            }
            isInitialLoad.current = false;
          });
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsSyncing(false);
        }
      } else {
        // User signed out - keep local data
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        isInitialLoad.current = true;
      }
    });
    return () => {
      unsubscribe();
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  // Persistence: Save locally and to cloud (debounced)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      
      // Skip sync if this update came from Firebase
      if (skipNextSync.current) {
        skipNextSync.current = false;
        return;
      }
      
      // Debounced sync to Firebase if logged in
      if (user && !isInitialLoad.current) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          setIsSyncing(true);
          saveUserData(user.uid, tasks)
            .then(() => setLastSynced(new Date()))
            .catch(console.error)
            .finally(() => setIsSyncing(false));
        }, 1000); // Debounce 1 second
      }
    } catch (e) {
      console.error("Failed to save tasks", e);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [tasks, user]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Drag start distance for mouse
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press (250ms) to start drag on touch devices
        tolerance: 5, // Movement tolerance during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const handleAddTask = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await parseTaskFromInput(text);
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: result.title,
        description: result.description,
        priority: result.priority,
        status: result.status,
        tags: result.tags,
        dependencies: result.dependencies,
        blockers: result.blockers,
        createdAt: new Date().toISOString(),
        isArchived: false
      };
      setTasks((prev) => [newTask, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add task", error);
      alert("Sorry, I couldn't process that. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleArchiveTask = (id: string) => {
    if (undoTimeout.current) {
      clearTimeout(undoTimeout.current);
    }

    setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: true } : t));
    setLastArchivedId(id);
    setShowUndo(true);

    undoTimeout.current = setTimeout(() => {
      setShowUndo(false);
      setLastArchivedId(null);
    }, 5000);
  };

  const handleStatusChange = (id: string, newStatus: Status) => {
    const task = tasks.find(t => t.id === id);
    const wasNotDone = task && task.status !== Status.DONE;
    
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    
    // Trigger confetti when moving to Done
    if (newStatus === Status.DONE && wasNotDone) {
      triggerConfetti();
    }
  };

  const handleUndoArchive = () => {
    if (!lastArchivedId) return;
    
    setTasks(prev => prev.map(t => t.id === lastArchivedId ? { ...t, isArchived: false } : t));
    
    setShowUndo(false);
    setLastArchivedId(null);
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
  };

  const handleRestoreTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: false } : t));
  };

  const handleDeleteForever = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleCloseToast = () => {
    setShowUndo(false);
  };

  const handleArchiveDoneTasks = () => {
    setTasks(prev => prev.map(t => t.status === Status.DONE ? { ...t, isArchived: true } : t));
  };

  // --- DnD Handlers ---

  const onDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setDragStartStatus(task.status);
    }
    setActiveId(event.active.id as string);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);
    
    if (!activeTask) return;

    const activeStatus = activeTask.status;
    const overStatus = overTask ? overTask.status : (Object.values(Status).includes(overId as Status) ? overId as Status : null);

    if (!overStatus || activeStatus === overStatus) return;

    setTasks((prev) => {
      return prev.map(t => {
        if (t.id === activeId) {
          return { ...t, status: overStatus };
        }
        return t;
      });
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Check for completion trigger
    const activeTask = tasks.find(t => t.id === active.id);
    if (activeTask && activeTask.status === Status.DONE && dragStartStatus !== Status.DONE) {
      triggerConfetti();
    }

    if (!over) {
      setActiveId(null);
      setDragStartStatus(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const overTask = tasks.find(t => t.id === overId);

    if (activeTask && overTask && activeTask.status === overTask.status) {
      const activeIndex = tasks.findIndex(t => t.id === activeId);
      const overIndex = tasks.findIndex(t => t.id === overId);
      
      if (activeIndex !== overIndex) {
        setTasks((prev) => arrayMove(prev, activeIndex, overIndex));
      }
    }

    setActiveId(null);
    setDragStartStatus(null);
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;
  const visibleTasks = tasks.filter(t => !t.isArchived);
  const archivedTasks = tasks.filter(t => t.isArchived);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="h-14 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 z-10 shrink-0 transition-all duration-200">
        <div className="flex items-center gap-2.5">
          <Logo className="w-8 h-8" />
          <h1 className="font-bold text-base tracking-tight text-gray-800">Brain Dump</h1>
        </div>

        <div className="flex items-center gap-2">
          <UserMenu
            user={user}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            isSyncing={isSyncing}
            lastSynced={lastSynced}
          />

          <button 
            onClick={() => setIsArchiveModalOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-indigo-600 transition-colors"
            title="View Archives"
          >
            <History size={20} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black hover:bg-gray-800 text-white px-3.5 py-1.5 rounded-full font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-gray-300/50 transition-all active:scale-95"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      {/* Main Board Area */}
      {/* 
        Layout Strategy:
        - Mobile: Vertical scrolling container (overflow-y-auto).
        - Laptop: Horizontal layout with internal column scrolling, page scrolls if needed.
      */}
      <main className="flex-1 overflow-auto relative">
        <div className="min-h-full scroll-smooth bg-[#F5F5F7] custom-scrollbar">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            {/* 
               Board Content:
               - Mobile: flex-col, auto height (stacks)
               - Laptop: flex-row, auto height, scrollable
            */}
            <div className="
              flex flex-col md:flex-row 
              min-h-full 
              w-full
              px-4 pt-4 pb-28 md:pb-4 md:px-6
              gap-6 md:gap-8 
              items-start
            ">
              {COLUMNS.map((col) => (
                <Column
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  tasks={visibleTasks.filter((t) => t.status === col.id)}
                  onArchiveTask={handleArchiveTask}
                  onStatusChange={handleStatusChange}
                  onClearColumn={col.id === Status.DONE ? () => setIsClearDoneModalOpen(true) : undefined}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
              }}>
              {activeTask ? <TaskCard task={activeTask} onArchive={() => {}} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Quick AI FAB - Only visible on Mobile typically, or bottom right always */}
      <div className="fixed bottom-6 right-6 z-20 md:bottom-8 md:right-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-200 border border-indigo-500/50 transition-all hover:scale-105 active:scale-95"
          title="Brain Dump"
        >
          <BrainCircuit size={26} className="group-hover:animate-pulse" />
        </button>
      </div>

      <AIInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
        isProcessing={isProcessing}
      />

      <Snackbar
        message="Task archived"
        isVisible={showUndo}
        onUndo={handleUndoArchive}
        onClose={handleCloseToast}
      />

      <ConfirmationModal
        isOpen={isClearDoneModalOpen}
        onClose={() => setIsClearDoneModalOpen(false)}
        onConfirm={handleArchiveDoneTasks}
        title="Archive Completed Tasks"
        message="Are you sure you want to archive all tasks in the Done column? You can view them later in the archive history."
        confirmLabel="Archive All"
      />

      <ArchiveModal 
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        archivedTasks={archivedTasks}
        onRestore={handleRestoreTask}
        onDeleteForever={handleDeleteForever}
      />

      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        version={APP_VERSION}
        changes={CHANGELOG}
      />
    </div>
  );
}
