import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';
import {
  ShieldAlert,
  Users,
  Layers,
  PackagePlus,
  Settings,
  Activity,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [usersCount, setUsersCount] = useState<number>(0);
  const [plansCount, setPlansCount] = useState<number>(0);
  const [addonsCount, setAddonsCount] = useState<number>(0);
  const [settingsCount, setSettingsCount] = useState<number>(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        const [usersRes, plansRes, addonsRes, settingsRes, logsRes] = await Promise.all([
          apiClient.get('/auth/users'),
          apiClient.get('/plans'),
          apiClient.get('/addons'),
          apiClient.get('/settings'),
          apiClient.get('/audit-logs?limit=5'),
        ]);

        if (usersRes.data.success) setUsersCount(usersRes.data.data.length);
        if (plansRes.data.success) setPlansCount(plansRes.data.data.length);
        if (addonsRes.data.success) setAddonsCount(addonsRes.data.data.length);
        if (settingsRes.data.success) setSettingsCount(settingsRes.data.data.length);
        if (logsRes.data.success) setRecentLogs(logsRes.data.data.logs || []);
      } catch (err) {
        console.error('Failed to load admin overview data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-neutral-600 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold">Loading system administration metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-[10px] font-bold tracking-wider uppercase">
              System Admin Console
            </span>
            <span className="text-xs text-neutral-500 font-medium">Logged in as {user?.fullName}</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
            Platform Configuration & Governance Center
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage user accounts, curriculum plan masters, commercial add-ons, pricing parameters, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/admin/settings">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sliders className="w-3.5 h-3.5 text-neutral-700" />}
            >
              Configure Pricing
            </Button>
          </NavLink>
          <NavLink to="/admin/users">
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm"
              leftIcon={<Users className="w-3.5 h-3.5" />}
            >
              Manage Users
            </Button>
          </NavLink>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Users</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-neutral-900">{usersCount}</span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Provisioned BD & Manager Accounts</span>
        </Card>

        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Curriculum Plans</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-neutral-900">{plansCount}</span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Base, Standard, and Premium Plans</span>
        </Card>

        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Commercial Add-ons</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <PackagePlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-neutral-900">{addonsCount}</span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Active Catalog Add-on Products</span>
        </Card>

        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">System Settings</span>
            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
              <Settings className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-neutral-900">{settingsCount}</span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Global Pricing & GST Parameters</span>
        </Card>
      </div>

      {/* Quick Governance Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Configuration Status */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-neutral-900">Platform Core Parameters</h3>
            </div>
            <NavLink
              to="/admin/settings"
              className="text-xs text-red-700 hover:text-red-800 font-bold flex items-center gap-1"
            >
              Modify <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900">Statutory GST Rate</p>
                <p className="text-[11px] text-neutral-500">Applied automatically to all new proposals</p>
              </div>
              <span className="font-mono font-bold text-base text-neutral-900">18.0%</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900">Default Hourly Rate Baseline</p>
                <p className="text-[11px] text-neutral-500">System baseline for hourly curriculum pricing</p>
              </div>
              <span className="font-mono font-bold text-base text-neutral-900">₹40 / hr / student</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900">Proposal Security Token Validity</p>
                <p className="text-[11px] text-neutral-500">Expiry duration for public cryptographic links</p>
              </div>
              <span className="font-mono font-bold text-base text-neutral-900">30 Days</span>
            </div>
          </div>
        </Card>

        {/* Recent Audit Log Feed */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-neutral-900">Recent Governance Logs</h3>
            </div>
            <NavLink
              to="/admin/audit-logs"
              className="text-xs text-red-700 hover:text-red-800 font-bold flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {recentLogs.length === 0 ? (
              <p className="text-neutral-500 py-4 text-center">No recent audit logs available.</p>
            ) : (
              recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-neutral-900">{log.action}</span>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      By: {log.user?.fullName || 'System / College'} ({log.entity})
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
