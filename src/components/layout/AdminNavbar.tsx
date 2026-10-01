import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldAlert } from 'lucide-react';
import { GenesisLogo } from '../common/GenesisLogo';

export const AdminNavbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <GenesisLogo size="md" variant="dark" />
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          <span>System Administration Console</span>
        </div>
      </div>

      {/* User Actions & Sign Out */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-neutral-900">{user.fullName}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full border border-red-200 bg-red-50 text-red-800 mt-0.5">
                SYSTEM_ADMIN
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout from Admin Console"
              className="p-2 text-neutral-600 hover:text-red-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
