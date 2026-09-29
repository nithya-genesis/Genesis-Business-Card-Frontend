import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Proposal } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Building2,
  FileCheck,
  Search,
} from 'lucide-react';

export const PendingApprovalPage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Action states
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState<boolean>(false);
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPendingProposals = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/proposals/pending-approval');
      if (res.data.success) {
        const raw = res.data.data;
        const list = Array.isArray(raw?.proposals) ? raw.proposals : (Array.isArray(raw) ? raw : []);
        setProposals(list);
      } else {
        setProposals([]);
      }
    } catch (err) {
      console.error('Failed to load pending proposals:', err);
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProposals();
  }, []);

  const handleApprove = async () => {
    if (!selectedProposal) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      const res = await apiClient.post(`/proposals/${selectedProposal.id}/approve`);
      if (res.data.success) {
        setIsApproveOpen(false);
        setSelectedProposal(null);
        fetchPendingProposals();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to approve proposal');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProposal) return;
    if (!rejectionReason.trim()) {
      setActionError('A specific rejection reason is mandatory.');
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    try {
      const res = await apiClient.post(`/proposals/${selectedProposal.id}/reject`, {
        rejectionReason,
      });
      if (res.data.success) {
        setIsRejectOpen(false);
        setSelectedProposal(null);
        setRejectionReason('');
        fetchPendingProposals();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to reject proposal');
    } finally {
      setIsProcessing(false);
    }
  };

  const safeProposals = Array.isArray(proposals) ? proposals : [];
  const filteredProposals = safeProposals.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const num = (p.proposalNumber || p.proposalId || '').toLowerCase();
    return (
      num.includes(term) ||
      (p.college?.name || '').toLowerCase().includes(term) ||
      (p.createdBy?.fullName || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Manager Approvals Queue
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Proposals confirmed by institutions awaiting BD Manager sign-off and commercial verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {proposals.length} Proposals Pending Review
          </span>
        </div>
      </div>

      {/* Search Toolbar */}
      <Card className="p-3.5 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pending proposals by number, institution, or executive..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>
        <div className="text-xs text-neutral-500">
          Showing <span className="font-bold text-neutral-900">{filteredProposals.length}</span> awaiting decision
        </div>
      </Card>

      {/* Pending Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3.5">Proposal #</th>
                <th className="p-3.5">Institution Name</th>
                <th className="p-3.5">Curriculum Plan</th>
                <th className="p-3.5">Batch Size</th>
                <th className="p-3.5">Cost / Std (Pre-GST)</th>
                <th className="p-3.5">Grand Total (Incl GST)</th>
                <th className="p-3.5">BD Executive</th>
                <th className="p-3.5">Submitted On</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-neutral-500">
                    Loading pending proposals...
                  </td>
                </tr>
              ) : filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-neutral-500">
                    <FileCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <div className="text-sm font-bold text-neutral-800">All caught up!</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      There are no proposals currently waiting for your managerial approval.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-900">
                      {prop.proposalNumber || prop.proposalId}
                    </td>
                    <td className="p-3.5 font-medium text-neutral-900 max-w-[200px]">
                      <div className="truncate font-bold">{prop.college?.name || 'Unknown College'}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        {prop.college?.city}, {prop.college?.state}
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-neutral-800">
                      {prop.planType === 'CUSTOM' ? (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">
                          Custom Modular Plan
                        </span>
                      ) : (
                        prop.plan?.name || prop.planType || 'Standard'
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-neutral-900">
                      {prop.studentCount}
                    </td>
                    <td className="p-3.5 font-mono text-neutral-700">
                      {formatCurrency(prop.costPerStudentBeforeGst || ((prop.taxableAmount || prop.subtotal || 0) / (prop.studentCount || 1)))}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-neutral-950">
                      {formatCurrency(prop.grandTotal)}
                    </td>
                    <td className="p-3.5 text-neutral-600">
                      {prop.createdBy?.fullName || 'BD Executive'}
                    </td>
                    <td className="p-3.5 text-neutral-500">{formatDate(prop.updatedAt)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <NavLink
                          to={`/proposals/${prop.id}`}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors text-xs font-semibold flex items-center gap-1"
                          title="Detailed Review"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </NavLink>

                        <button
                          onClick={() => {
                            setSelectedProposal(prop);
                            setActionError(null);
                            setIsApproveOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
                          title="Quick Approve"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProposal(prop);
                            setRejectionReason('');
                            setActionError(null);
                            setIsRejectOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-xs font-semibold"
                          title="Reject Proposal"
                        >
                          <XCircle className="w-3.5 h-3.5" />
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

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        title="Approve Proposal & Authorize Contract"
        subtitle={`Proposal ${selectedProposal?.proposalNumber || selectedProposal?.proposalId} - ${selectedProposal?.college?.name}`}
        maxWidth="md"
      >
        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{actionError}</span>
          </div>
        )}

        <div className="space-y-3 py-2 text-xs text-neutral-700">
          <p>
            You are approving proposal <strong className="font-mono text-neutral-900">{selectedProposal?.proposalNumber || selectedProposal?.proposalId}</strong> with a grand total of{' '}
            <strong className="font-mono text-emerald-800 text-sm">
              {formatCurrency(selectedProposal?.grandTotal || 0)}
            </strong>.
          </p>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 font-medium">
            <div className="flex justify-between">
              <span className="text-neutral-500">Institution:</span>
              <span className="text-neutral-900 font-bold">{selectedProposal?.college?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Batch Size:</span>
              <span className="font-mono text-neutral-900">{selectedProposal?.studentCount} Students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Cost / Student (Before GST):</span>
              <span className="font-mono text-neutral-900">
                {formatCurrency(selectedProposal?.costPerStudentBeforeGst || ((selectedProposal?.taxableAmount || selectedProposal?.subtotal || 0) / (selectedProposal?.studentCount || 1)))}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-500">
            Upon approval, the financial snapshot will be permanently locked, the executive will be notified, and the final 2-page PDF agreement will be generated for signing.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsApproveOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleApprove}
            isLoading={isProcessing}
          >
            Confirm Approval
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Reject Proposal Sizing"
        subtitle={`Proposal ${selectedProposal?.proposalNumber || selectedProposal?.proposalId} - ${selectedProposal?.college?.name}`}
        maxWidth="md"
      >
        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{actionError}</span>
          </div>
        )}

        <div className="space-y-3 py-2">
          <p className="text-xs text-neutral-700">
            Please explain why this proposal is being rejected. The creator executive will be notified to revise the commercial terms.
          </p>
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Rejection Reason & Commercial Feedback *
            </label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Discount exceeds allowed threshold for this batch size. Revise to maximum 10%."
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-500 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsRejectOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            isLoading={isProcessing}
          >
            Reject Proposal
          </Button>
        </div>
      </Modal>
    </div>
  );
};
