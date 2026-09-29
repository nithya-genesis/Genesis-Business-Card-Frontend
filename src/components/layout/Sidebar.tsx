import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  Layers,
  PackagePlus,
  ShieldAlert,
  PlusCircle,
  BookOpen,
  Sliders,
  Clock,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const isManager = user.role === 'BD_MANAGER';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-amber-500/10 text-amber-900 border-r-2 border-amber-500 font-bold'
        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
    }`;

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white p-4 flex flex-col justify-between min-h-[calc(100vh-4rem)] flex-shrink-0">
      <div className="space-y-6">
        {/* Quick Proposal Action */}
        <div>
          <NavLink
            to="/proposals/new"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs shadow-sm transition-all active:scale-[0.98] border border-amber-400"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Proposal</span>
          </NavLink>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 px-3.5 mb-1.5 block">
            BD Workspace
          </span>

          <NavLink to="/" className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview Dashboard</span>
          </NavLink>

          {isManager && (
            <NavLink to="/proposals/pending-approval" className={navLinkClass}>
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending Approvals</span>
            </NavLink>
          )}

          <NavLink to="/proposals" className={navLinkClass}>
            <FileSpreadsheet className="w-4 h-4" />
            <span>Proposals Matrix</span>
          </NavLink>

          <NavLink to="/colleges" className={navLinkClass}>
            <Building2 className="w-4 h-4" />
            <span>Colleges Directory</span>
          </NavLink>
        </div>

        {/* Product Catalog Reference */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 px-3.5 mb-1.5 block">
            Curriculum Catalog
          </span>

          <NavLink to="/plans" className={navLinkClass}>
            <Layers className="w-4 h-4" />
            <span>Training Plans</span>
          </NavLink>

          <NavLink to="/programs" className={navLinkClass}>
            <BookOpen className="w-4 h-4" />
            <span>Training Programs</span>
          </NavLink>

          <NavLink to="/addons" className={navLinkClass}>
            <PackagePlus className="w-4 h-4" />
            <span>Commercial Add-ons</span>
          </NavLink>
        </div>

        {/* BD Manager Governance & Approvals */}
        {isManager && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 px-3.5 mb-1.5 block">
              Management & Controls
            </span>

            <NavLink to="/settings" className={navLinkClass}>
              <Sliders className="w-4 h-4" />
              <span>Commercial Settings</span>
            </NavLink>

            <NavLink to="/audit-logs" className={navLinkClass}>
              <ShieldAlert className="w-4 h-4" />
              <span>Activity Audit Logs</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Footer Genesis Badge */}
      <div className="pt-4 border-t border-neutral-100 px-2 text-[11px] text-neutral-600 flex items-center justify-between">
        <span className="font-semibold">Genesis Platform v2.0</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Operational" />
      </div>
    </aside>
  );
};
