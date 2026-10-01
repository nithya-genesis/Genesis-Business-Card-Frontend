import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center text-neutral-700 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-sm font-semibold">Authenticating Genesis workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If System Admin accesses normal workspace, redirect directly to Admin Workspace
  if (user?.role === 'SYSTEM_ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-neutral-900 flex flex-col selection:bg-amber-400 selection:text-neutral-950">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#FAFAF7]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
