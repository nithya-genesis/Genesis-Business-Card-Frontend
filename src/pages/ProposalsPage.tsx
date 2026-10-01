import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Proposal, Plan } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { QRModal } from '../components/common/QRModal';
import { formatINR, formatDate } from '../utils/formatters';
import {
  FileSpreadsheet,
  PlusCircle,
  Search,
  Eye,
  QrCode,
  FileDown,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const ProposalsPage: React.FC = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedQrProposal, setSelectedQrProposal] = useState<Proposal | null>(null);
  const [proposalToArchive, setProposalToArchive] = useState<Proposal | null>(null);
  const [archiveReason, setArchiveReason] = useState<string>('');
  const [isArchiving, setIsArchiving] = useState<boolean>(false);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/proposals', {
        params: {
          page,
          limit: 15,
          search,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          planId: planFilter || undefined,
          sortBy,
        },
      });
      if (res.data.success) {
        setProposals(res.data.data.proposals);
        setTotal(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await apiClient.get('/plans');
        if (res.data.success) setPlans(res.data.data);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProposals();
    }, 200);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter, planFilter, sortBy]);

  const isManager = user?.role === 'BD_MANAGER';

  const handleQuickApprove = async (proposalId: string) => {
    try {
      const res = await apiClient.post(`/proposals/${proposalId}/approve`, {
        notes: 'Executive approval granted via Proposal Overview',
      });
      if (res.data.success) {
        fetchProposals();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleArchive = async () => {
    if (!proposalToArchive) return;
    setIsArchiving(true);
    try {
      await apiClient.delete(`/proposals/${proposalToArchive.id}`, {
        data: { reason: archiveReason.trim() || undefined },
      });
      setProposalToArchive(null);
      setArchiveReason('');
      fetchProposals();
    } catch (err: any) {
      console.error('Failed to archive proposal:', err);
      alert(err.response?.data?.message || 'Failed to archive proposal.');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDownloadPdf = async (prop: Proposal) => {
    try {
      const res = await apiClient.get(`/proposals/${prop.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Genesis-Proposal-${prop.proposalId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download PDF error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-500" />
            Institutional Proposals Roster
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track live statuses, college revisions, and manage executive approvals
          </p>
        </div>

        <NavLink to="/proposals/new">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Generate New Proposal
          </Button>
        </NavLink>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search Proposal ID, College, Officer..."
              className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="ALL">All Active Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SHARED">Shared</option>
              <option value="VIEWED">Viewed by College</option>
              <option value="MODIFIED_BY_COLLEGE">Modified by College</option>
              <option value="SUBMITTED">Submitted (Pending Approval)</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="">All Curriculum Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} Plan ({p.totalHours}h)
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest_value">Sort: Highest Valuation</option>
              <option value="lowest_value">Sort: Lowest Valuation</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-neutral-500 pt-1 flex justify-between items-center">
          <span>Found <strong className="text-neutral-900 font-bold">{total}</strong> total proposals</span>
          <span className="text-[11px] text-amber-800 font-semibold">Page {page} of {Math.max(1, Math.ceil(total / 15))}</span>
        </div>
      </Card>

      {/* Proposals Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3.5">Proposal ID</th>
                <th className="p-3.5">Institution</th>
                <th className="p-3.5">Plan & Hours</th>
                <th className="p-3.5">Students</th>
                <th className="p-3.5">Total Valuation</th>
                <th className="p-3.5">Version</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Created By</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-neutral-500">
                    Loading proposals...
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-neutral-500">
                    No proposals match the selected filters.
                  </td>
                </tr>
              ) : (
                proposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-800">
                      <NavLink to={`/proposals/${prop.id}`} className="hover:underline">
                        {prop.proposalId}
                      </NavLink>
                    </td>
                    <td className="p-3.5 font-bold text-neutral-900 max-w-[200px]">
                      <div className="truncate font-semibold">{prop.college?.name}</div>
                      <div className="text-[10px] text-neutral-500">{prop.college?.city}, {prop.college?.state}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-neutral-800">{prop.plan?.name}</span>
                      <span className="text-[10px] text-neutral-500 block font-mono">{prop.totalHours} hrs</span>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-neutral-900">
                      {prop.studentCount}
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-neutral-900">
                      {formatINR(prop.finalTotal)}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] font-mono font-bold text-neutral-700">
                        v{prop.currentVersion}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="status" status={prop.status} size="sm" />
                    </td>
                    <td className="p-3.5 text-neutral-500">
                      {prop.createdBy?.fullName || 'BD Team'}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isManager && prop.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleQuickApprove(prop.id)}
                            title="Approve Proposal"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedQrProposal(prop)}
                          title="Generate / Share QR"
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-amber-100 text-neutral-800 hover:text-amber-900 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(prop)}
                          title="Download PDF"
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>

                        <NavLink
                          to={`/proposals/${prop.id}`}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </NavLink>

                        {isManager && prop.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => {
                              setProposalToArchive(prop);
                              setArchiveReason('');
                            }}
                            title="Archive Proposal"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
          collegeName={selectedQrProposal.college?.name || 'Institution'}
        />
      )}

      {/* Archive Confirmation Modal */}
      {proposalToArchive && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Archive Proposal</h3>
                <p className="text-xs text-neutral-500 font-mono">{proposalToArchive.proposalId}</p>
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-neutral-200 text-neutral-700">
              <div className="flex justify-between">
                <span className="text-neutral-500">Institution:</span>
                <span className="font-semibold text-neutral-900">{proposalToArchive.college?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Curriculum Plan:</span>
                <span className="font-semibold text-neutral-900">{proposalToArchive.plan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Valuation:</span>
                <span className="font-mono font-bold text-neutral-900">{formatINR(proposalToArchive.finalTotal)}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600">
              Archiving will immediately remove this proposal from active dashboards and pipeline figures, while preserving historical records, versions, and audit logs. The creator BD Executive will be notified.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 block">
                Reason for Archiving (Optional)
              </label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="e.g., Client cancelled evaluation, duplicated entry, budget renegotiation..."
                rows={2}
                className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProposalToArchive(null)}
                disabled={isArchiving}
              >
                Cancel
              </Button>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50"
              >
                {isArchiving ? 'Archiving...' : 'Archive Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
