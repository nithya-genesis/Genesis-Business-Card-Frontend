import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import { GenesisLogo } from '../common/GenesisLogo';
import { NotificationBell } from '../common/NotificationBell';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'BD_MANAGER':
        return 'border-amber-200 bg-amber-50 text-amber-900';
      case 'BD_EXECUTIVE':
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'System Admin';
      case 'BD_MANAGER':
        return 'BD Manager';
      case 'BD_EXECUTIVE':
      default:
        return 'BD Executive';
    }
  };

  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <GenesisLogo size="md" variant="dark" />
        <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
          Enterprise Portal
        </span>
      </div>

      {/* User Actions & Role Indicator */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3">
            <NotificationBell />

            <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-neutral-900">{user.fullName}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mt-0.5 ${getRoleBadgeVariant(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
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
