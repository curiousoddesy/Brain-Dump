import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { LogIn, LogOut, Cloud, Crown, Bell } from 'lucide-react';

interface UserMenuProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
  lastSynced: Date | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  user, 
  onSignIn, 
  onSignOut, 
  isSyncing,
  lastSynced 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatLastSynced = () => {
    if (!lastSynced) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSynced.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSynced.toLocaleTimeString();
  };

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <LogIn size={16} />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }


  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
        )}
        {isSyncing ? (
          <Cloud size={14} className="text-indigo-500 animate-pulse" />
        ) : (
          <Cloud size={14} className="text-green-500" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 sm:hidden" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-medium text-sm text-gray-900 truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {isSyncing ? (
                  <>
                    <Cloud size={12} className="text-indigo-500 animate-pulse" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Cloud size={12} className="text-green-500" />
                    <span>Synced {formatLastSynced()}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                alert('Notifications coming soon!');
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Bell size={16} />
              Notifications
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                alert('Premium subscription coming soon!');
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 transition-colors"
            >
              <Crown size={16} />
              Get Premium
            </button>

            <button
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
