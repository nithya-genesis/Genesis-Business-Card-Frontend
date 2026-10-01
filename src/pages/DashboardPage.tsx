import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { DashboardMetrics, Proposal } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { QRModal } from '../components/common/QRModal';
import { PlanComparisonModal } from '../components/common/PlanComparisonModal';
import { formatINR, formatDate } from '../utils/formatters';
import {
  Building2,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  QrCode,
  FileDown,
  Layers,
  ArrowUpRight,
  Activity,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metricsData, setMetricsData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedQrProposal, setSelectedQrProposal] = useState<Proposal | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await apiClient.get('/dashboard/metrics');
        if (res.data.success) {
          setMetricsData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-neutral-600 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold">Loading analytics dashboard...</p>
      </div>
    );
  }

  const metrics = metricsData?.metrics || {
    totalColleges: 0,
    totalProposals: 0,
    activeProposals: 0,
    pendingApproval: 0,
    approvedProposals: 0,
    totalProposalVolume: 0,
    pendingApprovalVolume: 0,
    approvedDealsVolume: 0,
    totalPipelineValue: 0,
  };

  const handleDownloadPdf = async (proposalId: string, proposalCode: string) => {
    try {
      const response = await apiClient.get(`/proposals/${proposalId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Genesis-Proposal-${proposalCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download proposal PDF:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            Welcome back, {user?.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Genesis Executive Proposal Pipeline & Institutional Recruitment Command Center
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlanModalOpen(true)}
            leftIcon={<Layers className="w-3.5 h-3.5 text-amber-600" />}
          >
            Compare Plans
          </Button>

          <NavLink to="/colleges/new">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Building2 className="w-3.5 h-3.5 text-neutral-700" />}
            >
              Add College
            </Button>
          </NavLink>

          <NavLink to="/proposals/new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              New Proposal
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Commercial Value Volume Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hoverEffect className="relative overflow-hidden border-amber-300 bg-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">Total Proposal Volume</span>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-900">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-neutral-950 font-mono">
              {formatINR(metrics.totalProposalVolume || metrics.totalPipelineValue || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-amber-900 font-medium mt-1">
            <span>Cumulative active proposals</span>
            <span className="font-bold">{metrics.totalProposals} Proposals</span>
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden border-amber-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Pending Approval Volume</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-800 font-mono">
              {formatINR(metrics.pendingApprovalVolume || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium mt-1">
            <span>Awaiting BD Manager review</span>
            <span className="font-bold text-amber-800">{metrics.pendingApproval} Pending</span>
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Approved Deals Volume</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-800 font-mono">
              {formatINR(metrics.approvedDealsVolume || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-900 font-medium mt-1">
            <span>Locked institutional agreements</span>
            <span className="font-bold text-emerald-800">{metrics.approvedProposals} Deals</span>
          </div>
        </Card>
      </div>

      {/* Secondary Counts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect className="relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Colleges</span>
            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-neutral-900">{metrics.totalColleges}</span>
            <span className="text-[10px] text-neutral-500">Partner campuses</span>
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Pipeline</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-neutral-900">{metrics.activeProposals}</span>
            <span className="text-[10px] text-blue-700 font-semibold">Shared & viewed</span>
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Awaiting Decision</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-700">{metrics.pendingApproval}</span>
            <span className="text-[10px] text-amber-700">In review queue</span>
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Confirmed Deals</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-800">{metrics.approvedProposals}</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Ready for MoU</span>
          </div>
        </Card>
      </div>

      {/* Curriculum Distribution & Status Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Adoption */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-neutral-900">Curriculum Plan Volume Distribution</h3>
            </div>
            <span className="text-[11px] text-neutral-600 font-medium">By cumulative proposal INR</span>
          </div>

          <div className="space-y-3 pt-2">
            {metricsData?.planDistribution.map((plan) => (
              <div key={plan.planId} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{plan.planName} Plan</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500 font-medium">{plan.count} Proposals</span>
                    <span className="font-bold text-neutral-900 font-mono">
                      {formatINR(plan.totalValue)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        metrics.totalPipelineValue > 0
                          ? Math.min(100, Math.max(8, (plan.totalValue / metrics.totalPipelineValue) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Status Breakdown Mini Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-neutral-900">Status Breakdown</h3>
            </div>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {metricsData &&
              Object.entries(metricsData.statusDistribution).map(([status, count]) => {
                if (count === 0 && !['DRAFT', 'SHARED', 'SUBMITTED', 'APPROVED'].includes(status)) return null;
                return (
                  <div key={status} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50">
                    <Badge variant="status" status={status} size="sm" />
                    <span className="font-mono font-bold text-neutral-800">{count}</span>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* Recent Proposals Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Recent Institutional Proposals</h3>
            <p className="text-[11px] text-neutral-500">Live proposal pipelines across college partners</p>
          </div>
          <NavLink
            to="/proposals"
            className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1"
          >
            View All Proposals <ArrowUpRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3">Proposal ID</th>
                <th className="p-3">College</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Students</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {metricsData?.recentProposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-neutral-500">
                    No proposals generated yet. Click 'New Proposal' to create one!
                  </td>
                </tr>
              ) : (
                metricsData?.recentProposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-800">
                      <NavLink to={`/proposals/${prop.id}`} className="hover:underline">
                        {prop.proposalId}
                      </NavLink>
                    </td>
                    <td className="p-3 font-bold text-neutral-900 max-w-[200px] truncate">
                      {prop.college?.name}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[10px] font-semibold">
                        {prop.plan?.name}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold">{prop.studentCount}</td>
                    <td className="p-3 font-mono font-extrabold text-neutral-900">
                      {formatINR(prop.finalTotal)}
                    </td>
                    <td className="p-3">
                      <Badge variant="status" status={prop.status} size="sm" />
                    </td>
                    <td className="p-3 text-neutral-500">{formatDate(prop.createdAt)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedQrProposal(prop)}
                          title="Generate / View QR"
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-amber-100 text-neutral-800 hover:text-amber-900 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(prop.id, prop.proposalId)}
                          title="Download PDF"
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* QR Code Modal */}
      {selectedQrProposal && (
        <QRModal
          isOpen={!!selectedQrProposal}
          onClose={() => setSelectedQrProposal(null)}
          proposalId={selectedQrProposal.id}
          proposalCode={selectedQrProposal.proposalId}
          collegeName={selectedQrProposal.college?.name || 'College'}
        />
      )}

      {/* Plan Matrix Comparison Modal */}
      <PlanComparisonModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
    </div>
  );
};
