import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminNavbar } from '../components/layout/AdminNavbar';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { Loader2 } from 'lucide-react';

export const SystemAdminLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-neutral-300 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        <span className="text-sm font-semibold">Authenticating System Administrator...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== 'SYSTEM_ADMIN') {
    // Non-admin trying to access /admin -> redirect to normal workspace
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-neutral-900 flex flex-col selection:bg-red-400 selection:text-white">
      <AdminNavbar />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#FAFAF7]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
