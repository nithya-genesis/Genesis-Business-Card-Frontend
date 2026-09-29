import React, { useEffect, useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Proposal } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { QRModal } from '../components/common/QRModal';
import { Modal } from '../components/common/Modal';
import { ProposalVersionDrawer } from '../components/common/ProposalVersionDrawer';
import { formatINR, formatDate, formatDateTime } from '../utils/formatters';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  Users,
  QrCode,
  FileDown,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  MessageSquare,
  Edit3,
  Archive,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProposalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState<boolean>(false);

  // Approval / Rejection Modals
  const [isApproveOpen, setIsApproveOpen] = useState<boolean>(false);
  const [approveNotes, setApproveNotes] = useState<string>('');
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchProposal = async () => {
    try {
      const res = await apiClient.get(`/proposals/${id}`);
      if (res.data.success) {
        setProposal(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load proposal details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProposal();
  }, [id]);

  const isManager = user?.role === 'BD_MANAGER';

  const handleApprove = async () => {
    if (!proposal) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post(`/proposals/${proposal.id}/approve`, {
        notes: approveNotes,
      });
      if (res.data.success) {
        setIsApproveOpen(false);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
        fetchProposal();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!proposal || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post(`/proposals/${proposal.id}/reject`, {
        rejectionReason: rejectReason,
      });
      if (res.data.success) {
        setIsRejectOpen(false);
        fetchProposal();
      }
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!proposal) return;
    try {
      const response = await apiClient.get(`/proposals/${proposal.id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Genesis-Proposal-${proposal.proposalId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download proposal PDF:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center text-neutral-500 text-xs">
        Loading proposal record...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="py-20 text-center text-neutral-500">
        <p>Proposal record not found</p>
        <NavLink to="/proposals" className="text-amber-800 underline mt-2 block text-xs">
          Back to Proposals
        </NavLink>
      </div>
    );
  }

  const subtotal = proposal.subtotal || (proposal.baseTrainingCost + (proposal.addonsTotalCost || 0) + (proposal.customItemsTotalCost || 0));
  const discountAmount = proposal.discountValue > 0
    ? (proposal.discountType === 'PERCENTAGE' ? (subtotal * proposal.discountValue) / 100 : proposal.discountValue)
    : 0;
  const taxableAmount = proposal.taxableAmount || Math.max(0, subtotal - discountAmount);
  const gstRate = proposal.gstRate || 18.0;
  const gstAmount = proposal.gstAmount || Math.round(((taxableAmount * gstRate) / 100) * 100) / 100;
  const grandTotal = proposal.grandTotal || proposal.finalTotal;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <NavLink
          to="/proposals"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Proposals
        </NavLink>

        <div className="flex items-center gap-2">
          {proposal.status !== 'APPROVED' && proposal.status !== 'ARCHIVED' && !proposal.isDeleted && (user?.role === 'BD_MANAGER' || user?.role === 'SYSTEM_ADMIN' || proposal.createdById === user?.id || proposal.createdBy?.id === user?.id) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-amber-700" />}
              className="border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-950 font-bold"
            >
              Edit Proposal
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVersionDrawerOpen(true)}
            leftIcon={<History className="w-3.5 h-3.5 text-amber-700" />}
          >
            Version History (v{proposal.currentVersion})
          </Button>

          {proposal.status !== 'ARCHIVED' && !proposal.isDeleted && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsQrOpen(true)}
              leftIcon={<QrCode className="w-3.5 h-3.5 text-neutral-800" />}
            >
              Share & QR
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            leftIcon={<FileDown className="w-3.5 h-3.5" />}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Header Banner */}
      <Card className="p-6 relative overflow-hidden bg-white border-amber-300/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-extrabold text-neutral-900">
                {proposal.proposalId}
              </span>
              <Badge variant="status" status={proposal.status} />
              {proposal.status === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <Lock className="w-3 h-3 text-emerald-600" /> Financials Locked
                </span>
              )}
            </div>

            <h1 className="text-xl font-extrabold text-neutral-900">{proposal.college?.name}</h1>
            <p className="text-xs text-neutral-500 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              {proposal.college?.city}, {proposal.college?.state} | Placement Lead: {proposal.college?.placementOfficerName}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-500 block font-medium">Grand Proposal Total</span>
            <span className="text-2xl font-black text-amber-900 font-mono">
              {formatINR(grandTotal)}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              INR (Indian Rupee) • Incl. 18% GST • Snapshot Rate: ₹{proposal.hourlyRateSnapshot}/hr
            </span>
          </div>
        </div>

        {/* Archive Banner */}
        {(proposal.status === 'ARCHIVED' || proposal.isDeleted) && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-zinc-700">
              <Archive className="w-4 h-4 text-zinc-600" /> Proposal Archived (Read-Only)
            </div>
            <p className="text-zinc-600 font-medium pl-5.5">
              This proposal was archived by the BD Manager{proposal.deletedAt ? ` on ${formatDateTime(proposal.deletedAt)}` : ''}.
              {proposal.archiveReason ? ` Reason: "${proposal.archiveReason}"` : ''}
            </p>
          </div>
        )}

        {/* Rejection Banner */}
        {proposal.status === 'REJECTED' && proposal.rejectionReason && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-700">
              <XCircle className="w-4 h-4" /> Manager Rejection Reason
            </div>
            <p className="text-red-800 font-medium pl-5.5">{proposal.rejectionReason}</p>
          </div>
        )}

        {/* Action Toolbar for Managers */}
        {isManager && proposal.status === 'PENDING_MANAGER_APPROVAL' && (
          <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
            <div>
              <span className="text-xs text-neutral-900 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Submitted by College — BD Manager Decision Required
              </span>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                The partner college has confirmed sizing and submitted the proposal for commercial authorization.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsRejectOpen(true)}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Reject
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                onClick={() => setIsApproveOpen(true)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approve Proposal
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 2-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Curriculum & Commercial Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Scope Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-900">Curriculum Scope</h3>
              </div>
              <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-2.5 py-0.5 rounded-lg border border-neutral-200">
                {proposal.planType === 'CUSTOM' ? 'Custom Modular Plan' : `${proposal.plan?.name || proposal.planType} Plan`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Total Duration</span>
                <span className="text-base font-extrabold text-neutral-900 font-mono mt-0.5 block">
                  {proposal.totalHours} Hours
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Enrolled Cohort</span>
                <span className="text-base font-extrabold text-neutral-900 font-mono mt-0.5 block">
                  {proposal.studentCount} Students
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Base Rate</span>
                <span className="text-base font-extrabold text-neutral-900 font-mono mt-0.5 block">
                  ₹{proposal.hourlyRateSnapshot}/hr
                </span>
              </div>
            </div>

            {/* Custom Programs or Standard Modules Table */}
            {proposal.planType === 'CUSTOM' && proposal.customProgramsData ? (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-neutral-700">Modular Training Programs</span>
                <div className="space-y-1.5">
                  {(() => {
                    let progList: any[] = [];
                    try {
                      progList = typeof proposal.customProgramsData === 'string'
                        ? JSON.parse(proposal.customProgramsData)
                        : (proposal.customProgramsData as any);
                    } catch (e) {
                      progList = [];
                    }
                    if (!Array.isArray(progList)) progList = [];
                    return progList.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-800 font-bold">{p.programName || p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded font-mono text-neutral-600">
                            {p.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-neutral-600 font-bold">{p.hours} hrs</span>
                          <span className="font-mono text-neutral-900 font-semibold text-[11px]">
                            {p.pricingType === 'PER_STUDENT' ? `₹${p.unitRate || p.rate || 0}/std` : `₹${p.unitRate || p.rate || 0}/hr`}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-neutral-700">Curriculum Module Allocation</span>
                <div className="space-y-1.5">
                  {proposal.plan?.modules?.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex justify-between items-center text-xs"
                    >
                      <span className="text-neutral-800 font-medium">{m.name}</span>
                      <span className="font-mono text-neutral-600 font-bold">{m.hours} hrs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Itemized Commercial Pricing Card with Per-Student Breakdown */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-900">Commercial Schedule & GST Breakdown</h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Currency: INR (₹)</span>
            </div>

            <div className="space-y-3">
              {/* Addons List */}
              {proposal.addons && proposal.addons.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-neutral-700">Selected Commercial Add-ons</span>
                  {proposal.addons.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold text-neutral-900 block">{a.nameSnapshot}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Unit: ₹{a.priceSnapshot} ({a.pricingTypeSnapshot.replace('_', ' ')})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-neutral-900">
                        {formatINR(a.calculatedCost)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Items List */}
              {proposal.customItems && proposal.customItems.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-neutral-700">Custom Proposal Items</span>
                  {proposal.customItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/80 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold text-neutral-900 block">{item.name}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {item.pricingType === 'PER_STUDENT'
                            ? `₹${item.unitPrice}/student (${proposal.studentCount} students)`
                            : `₹${item.unitPrice} × ${item.quantity}`}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-purple-950">
                        {formatINR(item.calculatedCost ?? item.totalCost ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals Summary */}
              <div className="pt-3 border-t border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Base Training Subtotal:</span>
                  <span className="font-mono text-neutral-900 font-semibold">{formatINR(proposal.baseTrainingCost)}</span>
                </div>
                {proposal.addonsTotalCost > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Add-ons Total:</span>
                    <span className="font-mono text-neutral-900 font-semibold">{formatINR(proposal.addonsTotalCost)}</span>
                  </div>
                )}
                {proposal.customItemsTotalCost > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Custom Items Total:</span>
                    <span className="font-mono text-purple-900 font-semibold">{formatINR(proposal.customItemsTotalCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-800 font-semibold pt-1 border-t border-neutral-100">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatINR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                    <span>Institutional Discount:</span>
                    <span className="font-mono font-bold">- {formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-900 font-bold">
                  <span>Taxable Base Amount:</span>
                  <span className="font-mono">{formatINR(taxableAmount)}</span>
                </div>
                <div className="flex justify-between text-amber-900 bg-amber-50/80 px-2.5 py-1.5 rounded-lg font-semibold border border-amber-200/60">
                  <span>Cost Per Student — Before GST:</span>
                  <span className="font-mono font-bold text-sm">
                    {formatINR(proposal.costPerStudentBeforeGst || Math.round((taxableAmount / (proposal.studentCount || 1)) * 100) / 100)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Applicable GST @ {gstRate}%:</span>
                  <span className="font-mono font-semibold">{formatINR(gstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-950 pt-2 border-t-2 border-amber-400 bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-2 rounded-lg">
                  <span>Grand Total (INR):</span>
                  <span className="font-mono text-base text-amber-900 font-black">{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Timeline & Contacts */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card className="space-y-3.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Proposal Metadata
            </span>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">BD Executive:</span>
                <span className="font-semibold text-neutral-900">{proposal.createdBy?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Created Date:</span>
                <span className="text-neutral-800">{formatDate(proposal.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Validity:</span>
                <span className="text-neutral-800">Until {formatDate(proposal.tokenExpiresAt)}</span>
              </div>
              {proposal.approvedBy && (
                <div className="flex justify-between pt-2 border-t border-neutral-100">
                  <span className="text-emerald-700 font-semibold">Approved By:</span>
                  <span className="font-bold text-neutral-900">{proposal.approvedBy.fullName}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Notes Card */}
          {(proposal.notes || proposal.collegeNotes) && (
            <Card className="space-y-3 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Notes & Remarks
              </span>

              {proposal.notes && (
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-500 block mb-0.5">Internal Remarks:</span>
                  <p className="text-neutral-700 italic">{proposal.notes}</p>
                </div>
              )}

              {proposal.collegeNotes && (
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-900 block mb-0.5">College Remarks:</span>
                  <p className="text-amber-950 italic">{proposal.collegeNotes}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* QR Modal */}
      <QRModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        proposalId={proposal.id}
        proposalCode={proposal.proposalId}
        collegeName={proposal.college?.name || 'Institution'}
      />

      {/* Version Drawer */}
      <ProposalVersionDrawer
        isOpen={isVersionDrawerOpen}
        onClose={() => setIsVersionDrawerOpen(false)}
        proposalId={proposal.id}
        versions={proposal.versions}
        currentVersion={proposal.currentVersion}
      />

      {/* Approve Proposal Modal */}
      <Modal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        title="Approve & Finalize Proposal"
        subtitle={`Proposal Reference #${proposal.proposalId} for ${proposal.college?.name}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-neutral-700">
          <p>
            Approving this proposal will officially lock the commercial financials, enable official PDF generation, and log your executive approval.
          </p>

          <div>
            <label className="block font-bold text-neutral-900 mb-1">
              Executive Approval Notes (Optional)
            </label>
            <textarea
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder="e.g. Approved batch schedule commencing Q2..."
              rows={3}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setIsApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
              isLoading={actionLoading}
              onClick={handleApprove}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Proposal Modal */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Reject Proposal"
        subtitle={`Proposal Reference #${proposal.proposalId}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-neutral-700">
          <p>
            Please provide a mandatory reason for rejecting this proposal. The BD Executive will be notified.
          </p>

          <div>
            <label className="block font-bold text-neutral-900 mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Requested discount exceeds authorized institutional margins..."
              rows={3}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!rejectReason.trim()}
              isLoading={actionLoading}
              onClick={handleReject}
            >
              Reject Proposal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
