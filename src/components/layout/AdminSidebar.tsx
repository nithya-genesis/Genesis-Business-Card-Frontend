import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  PackagePlus,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-red-500/10 text-red-900 border-r-2 border-red-500 font-bold'
        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
    }`;

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white p-4 flex flex-col justify-between min-h-[calc(100vh-4rem)] flex-shrink-0">
      <div className="space-y-6">
        {/* Admin Badge Header */}
        <div className="px-3.5 py-2 rounded-xl bg-red-50 border border-red-200/80 flex items-center gap-2 text-red-900">
          <ShieldCheck className="w-4 h-4 text-red-600 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider">Admin Workspace</span>
            <span className="text-[9px] text-red-700">Governance & Configuration</span>
          </div>
        </div>

        {/* Administration Links */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3.5 mb-1.5 block">
            System Control
          </span>

          <NavLink to="/admin" end className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </NavLink>

          <NavLink to="/admin/users" className={navLinkClass}>
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </NavLink>

          <NavLink to="/admin/colleges" className={navLinkClass}>
            <Layers className="w-4 h-4" />
            <span>Colleges Directory</span>
          </NavLink>
        </div>

        {/* Product & Curriculum Configuration */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3.5 mb-1.5 block">
            Curriculum Masters
          </span>

          <NavLink to="/admin/plans" className={navLinkClass}>
            <Layers className="w-4 h-4" />
            <span>Training Plans</span>
          </NavLink>

          <NavLink to="/admin/programs" className={navLinkClass}>
            <PackagePlus className="w-4 h-4" />
            <span>Training Programs</span>
          </NavLink>

          <NavLink to="/admin/addons" className={navLinkClass}>
            <PackagePlus className="w-4 h-4" />
            <span>Commercial Add-ons</span>
          </NavLink>
        </div>

        {/* System Settings & Audit */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3.5 mb-1.5 block">
            Settings & Audit
          </span>

          <NavLink to="/admin/settings" className={navLinkClass}>
            <Settings className="w-4 h-4" />
            <span>Pricing & Settings</span>
          </NavLink>

          <NavLink to="/admin/audit-logs" className={navLinkClass}>
            <ShieldAlert className="w-4 h-4" />
            <span>System Audit Logs</span>
          </NavLink>
        </div>
      </div>

      {/* Footer Badge */}
      <div className="pt-4 border-t border-neutral-100 px-2 text-[11px] text-neutral-500 flex items-center justify-between">
        <span className="font-semibold">Genesis Admin Core</span>
        <span className="w-2 h-2 rounded-full bg-red-500" title="Admin Mode Active" />
      </div>
    </aside>
  );
};
