import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { GenesisLogo } from '../components/common/GenesisLogo';
import { GenesisWatermark } from '../components/common/GenesisWatermark';
import { GenesisStepper } from '../components/common/GenesisStepper';
import { formatINR, formatDate, formatDateTime } from '../utils/formatters';
import {
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Zap,
  Download,
  Check,
  Package,
  MessageSquare,
  FileEdit,
  Plus,
  Minus,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import { DigitalAcceptance, DigitalApproval } from '../types';

interface CustomProgramItem {
  programId?: string;
  name?: string;
  programName?: string;
  code?: string;
  hours: number;
  pricingType: 'PER_STUDENT' | 'PER_HOUR' | 'FIXED';
  rate?: number;
  unitRate?: number;
  calculatedCost?: number;
}

interface CustomProposalItemData {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  pricingType: 'PER_STUDENT' | 'PER_HOUR' | 'FIXED' | 'FLAT' | 'PER_UNIT';
  unitPrice: number;
  calculatedCost?: number;
  totalCost?: number;
}

interface PublicProposalData {
  id: string;
  proposalId: string;
  publicToken: string;
  status: 'DRAFT' | 'SHARED' | 'VIEWED' | 'MODIFIED_BY_COLLEGE' | 'COLLEGE_MODIFIED' | 'PENDING_MANAGER_APPROVAL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  currentVersion: number;
  tokenExpiresAt: string;
  createdAt: string;
  college: {
    name: string;
    placementOfficerName?: string;
    placementOfficerEmail?: string;
    placementOfficerPhone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  plan: {
    id: string;
    name: string;
    code: string;
    description: string;
    totalHours: number;
    modules: Array<{ name: string; hours: number; displayOrder: number }>;
  };
  customPrograms?: CustomProgramItem[];
  studentCount: number;
  minStudents: number;
  maxStudents: number;
  totalHours: number;
  hourlyRate: number;
  baseTrainingCost: number;
  selectedAddons: Array<{
    addonId: string;
    nameSnapshot: string;
    pricingTypeSnapshot: string;
    priceSnapshot: number;
    calculatedCost: number;
  }>;
  availableAddons: Array<{
    id: string;
    name: string;
    code: string;
    description: string;
    pricingType: 'PER_STUDENT' | 'PER_HOUR' | 'FIXED';
    price: number;
  }>;
  addonsTotalCost: number;
  customItems?: CustomProposalItemData[];
  customItemsTotalCost?: number;
  discountValue: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  subtotal?: number;
  taxableAmount?: number;
  costPerStudentBeforeGst?: number;
  gstRate?: number;
  gstAmount?: number;
  grandTotal?: number;
  finalTotal?: number;
  currency: string;
  collegeNotes?: string | null;
  createdBy?: {
    fullName: string;
    email: string;
    phone?: string | null;
    role?: string;
  };
  digitalAcceptance?: DigitalAcceptance | null;
  digitalApproval?: DigitalApproval | null;
}

export const PublicProposalViewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [proposalData, setProposalData] = useState<PublicProposalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Interactive adjustments
  const [studentCount, setStudentCount] = useState<number>(100);
  const [customPrograms, setCustomPrograms] = useState<CustomProgramItem[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [collegeNotes, setCollegeNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Digital Acceptance Confirmation Modal
  const [isConfirmAcceptModalOpen, setIsConfirmAcceptModalOpen] = useState<boolean>(false);

  // Request Changes Modal State
  const [isRequestChangeOpen, setIsRequestChangeOpen] = useState<boolean>(false);
  const [changeReason, setChangeReason] = useState<string>('');
  const [isRequestingChange, setIsRequestingChange] = useState<boolean>(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!token) return;

    const fetchProposal = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/public/proposals/${token}`);
        if (res.data.success) {
          const data: PublicProposalData = res.data.data;
          setProposalData(data);
          setStudentCount(data.studentCount);
          setCustomPrograms(data.customPrograms || []);
          setSelectedAddonIds((data.selectedAddons || []).map((a) => a.addonId));
          setCollegeNotes(data.collegeNotes || '');
        }
      } catch (err: unknown) {
        console.error('Failed to load proposal:', err);
        const errObj = err as { response?: { data?: { message?: string } } };
        setErrorMessage(
          errObj.response?.data?.message ||
            'Unable to access this proposal. The link may have expired or is invalid.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposal();
  }, [token]);

  const isCustomPlan = Boolean(
    (customPrograms && customPrograms.length > 0) ||
    (proposalData?.customPrograms && proposalData.customPrograms.length > 0)
  );

  const isSubmitted =
    proposalData?.status === 'PENDING_MANAGER_APPROVAL' ||
    proposalData?.status === 'SUBMITTED' ||
    proposalData?.status === 'MODIFIED_BY_COLLEGE';
  const isApproved = proposalData?.status === 'APPROVED';
  const isLocked = isSubmitted || isApproved || proposalData?.status === 'REJECTED' || proposalData?.status === 'EXPIRED';

  const handleProgramHoursChange = (idx: number, newHours: number) => {
    if (isLocked) return;
    const clampedHours = Math.max(1, Math.min(500, Math.floor(newHours || 1)));
    setCustomPrograms((prev) => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], hours: clampedHours };
      }
      return next;
    });
  };

  // Authoritative dynamic calculation on parameter adjustments
  const livePricing = useMemo(() => {
    if (!proposalData) return null;

    const count = studentCount > 0 ? studentCount : 1;

    // 1. Base Training Cost
    let baseTrainingCost = 0;
    let totalTrainingHours = proposalData.totalHours || proposalData.plan?.totalHours || 0;
    const computedPrograms: Array<{ name: string; hours: number; unitRate: number; cost: number; pricingType: string }> = [];

    const activeCustomPrograms = customPrograms.length > 0 ? customPrograms : (proposalData.customPrograms || []);

    if (isCustomPlan && activeCustomPrograms.length > 0) {
      let customHoursSum = 0;
      for (const prog of activeCustomPrograms) {
        const pHours = prog.hours || 0;
        // CRITICAL RULE: Locked rate from proposal snapshot
        const pRate = prog.rate !== undefined ? prog.rate : (prog.unitRate || 0);
        const pType = prog.pricingType || 'PER_HOUR';
        const pName = prog.name || prog.programName || 'Training Module';

        customHoursSum += pHours;

        let pCost = 0;
        if (pType === 'PER_STUDENT') {
          pCost = pRate * count;
        } else if (pType === 'FIXED') {
          pCost = pRate;
        } else {
          // PER_HOUR: hours * rate * studentCount
          pCost = pHours * count * pRate;
        }

        baseTrainingCost += pCost;
        computedPrograms.push({
          name: pName,
          hours: pHours,
          unitRate: pRate,
          cost: pCost,
          pricingType: pType,
        });
      }
      totalTrainingHours = customHoursSum;
    } else {
      const rate = proposalData.hourlyRate || 40;
      baseTrainingCost = totalTrainingHours * count * rate;
    }

    // 2. Add-ons Total
    let addonsTotal = 0;
    const available = proposalData.availableAddons || [];
    selectedAddonIds.forEach((addonId) => {
      const addon = available.find((a) => a.id === addonId);
      if (addon) {
        if (addon.pricingType === 'PER_STUDENT') {
          addonsTotal += addon.price * count;
        } else if (addon.pricingType === 'PER_HOUR') {
          addonsTotal += addon.price * totalTrainingHours;
        } else {
          addonsTotal += addon.price;
        }
      }
    });

    // 3. Custom Items Total
    let customItemsTotal = 0;
    const computedCustomItems: Array<{ name: string; description?: string; unitPrice: number; calculatedCost: number; pricingType: string; quantity: number }> = [];
    if (proposalData.customItems && proposalData.customItems.length > 0) {
      for (const ci of proposalData.customItems) {
        const pType = ci.pricingType || 'PER_STUDENT';
        const unitPrice = ci.unitPrice || 0;
        let itemCost = 0;

        if (pType === 'PER_STUDENT') {
          itemCost = unitPrice * count;
        } else if (pType === 'PER_HOUR') {
          itemCost = unitPrice * totalTrainingHours;
        } else {
          itemCost = unitPrice * (ci.quantity || 1);
        }

        customItemsTotal += itemCost;
        computedCustomItems.push({
          name: ci.name,
          description: ci.description,
          unitPrice,
          calculatedCost: itemCost,
          pricingType: pType,
          quantity: pType === 'PER_STUDENT' ? count : (ci.quantity || 1),
        });
      }
    }

    // 4. Subtotal & Discount
    const subtotal = baseTrainingCost + addonsTotal + customItemsTotal;
    let discountAmount = 0;
    if (proposalData.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * (proposalData.discountValue || 0)) / 100);
    } else {
      discountAmount = proposalData.discountValue || 0;
    }

    // 5. Taxable Base & 18% GST
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const gstRate = 0.18;
    const gstAmount = Math.round(taxableAmount * gstRate);
    const grandTotal = taxableAmount + gstAmount;

    // 6. Strict Single Per-Student Metric: Pre-GST
    const costPerStudentBeforeGst = Math.round((taxableAmount / count) * 100) / 100;

    return {
      baseTrainingCost,
      totalTrainingHours,
      computedPrograms,
      addonsTotal,
      customItemsTotal,
      computedCustomItems,
      subtotal,
      discountAmount,
      taxableAmount,
      gstRate: 18,
      gstAmount,
      grandTotal,
      costPerStudentBeforeGst,
    };
  }, [proposalData, studentCount, selectedAddonIds, isCustomPlan, customPrograms]);

  const handleAddonToggle = (addonId: string) => {
    if (isLocked) return;
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleSaveAndSubmit = async () => {
    if (!token || !proposalData) return;
    setIsSubmitting(true);
    try {
      // Step 1: Update proposal parameters with authoritative backend calculation and locked program rates
      await axios.put(`${API_BASE_URL}/public/proposals/${token}`, {
        studentCount,
        selectedAddonIds,
        customPrograms,
        collegeNotes,
      });

      // Step 2: Final submission to manager review queue
      const submitRes = await axios.post(`${API_BASE_URL}/public/proposals/${token}/submit`, {
        collegeNotes,
      });

      if (submitRes.data.success) {
        setSubmitSuccess(true);
        setIsConfirmAcceptModalOpen(false);
        const acceptedRecord = submitRes.data.data?.digitalAcceptance || null;
        setProposalData((prev) =>
          prev
            ? {
                ...prev,
                status: 'PENDING_MANAGER_APPROVAL',
                studentCount,
                customPrograms,
                collegeNotes,
                digitalAcceptance: acceptedRecord || prev.digitalAcceptance,
              }
            : null
        );
      }
    } catch (err: unknown) {
      console.error('Failed to submit proposal modifications:', err);
      const errObj = err as { response?: { data?: { message?: string } } };
      alert(errObj.response?.data?.message || 'Failed to submit proposal configuration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !changeReason.trim()) return;
    setIsRequestingChange(true);
    setChangeError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/public/proposals/${token}/request-changes`, {
        reason: changeReason.trim(),
      });
      if (res.data.success) {
        setIsRequestChangeOpen(false);
        setChangeSuccess(true);
        setProposalData((prev) =>
          prev
            ? {
                ...prev,
                status: 'COLLEGE_MODIFIED',
                collegeNotes: changeReason.trim(),
              }
            : null
        );
      }
    } catch (err: unknown) {
      console.error('Failed to submit change request:', err);
      const errObj = err as { response?: { data?: { message?: string } } };
      setChangeError(errObj.response?.data?.message || 'Failed to submit change request. Please try again.');
    } finally {
      setIsRequestingChange(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/public/proposals/${token}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Genesis-Proposal-${proposalData?.proposalId || 'Document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download proposal PDF:', err);
      alert('Unable to generate PDF document. Please try again or contact Genesis.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-neutral-600">Loading verified institutional proposal...</p>
      </div>
    );
  }

  if (errorMessage || !proposalData) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4 shadow-lg border-neutral-200">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Proposal Inaccessible</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {errorMessage || 'This proposal link is invalid or has expired. Please request an updated link from your Genesis BD representative.'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-neutral-900 relative">
      <GenesisWatermark opacity={0.03} />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GenesisLogo className="h-7 w-auto" />
            <div className="hidden sm:block border-l border-neutral-200 pl-3">
              <span className="text-[11px] font-mono font-bold text-neutral-800">
                {proposalData.proposalId}
              </span>
              <span className="text-[10px] text-neutral-400 block font-sans">
                Genesis Corporate Proposal Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {proposalData.digitalApproval && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Digitally Approved
              </span>
            )}

            {proposalData.digitalAcceptance && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Digitally Accepted
              </span>
            )}

            <Badge variant="status" status={proposalData.status} />

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs font-semibold shadow-2xs"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-8">
        {/* Banner Section */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/40 via-transparent to-transparent rounded-bl-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold tracking-wider uppercase">
                  Institutional Training Proposal
                </span>
                <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  Valid until {formatDate(proposalData.tokenExpiresAt)}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-neutral-950 tracking-tight">
                {proposalData.college?.name}
              </h1>

              <p className="text-xs md:text-sm text-neutral-600 max-w-2xl leading-relaxed">
                Tailored placement and recruitment training proposal for {proposalData.college?.city || 'Campus'}, {proposalData.college?.state || ''}.
                Equipping students for tier-1 corporate recruitments.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-end text-right min-w-[200px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                Authorized Plan
              </span>
              <span className="text-lg font-black text-neutral-900 mt-0.5">
                {isCustomPlan ? 'Custom Modular Plan' : proposalData.plan?.name}
              </span>
              <span className="text-xs font-semibold text-amber-700 mt-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {livePricing?.totalTrainingHours || proposalData.totalHours} Hours Intensive Curriculum
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Banner */}
        {submitSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold">Proposal Submitted Successfully</p>
              <p className="text-[11px] text-emerald-700">
                Your proposal has been sent to the Genesis team for final approval.
              </p>
            </div>
          </div>
        )}

        {/* Change Request Banner */}
        {changeSuccess && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 animate-in fade-in">
            <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold">Change Request Sent Directly to Genesis BD Lead</p>
              <p className="text-[11px] text-amber-800">
                Your revision notes have been dispatched. Your dedicated Genesis representative will follow up promptly.
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Grid: Configurator on Left, Live Financials on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Configuration */}
          <div className="lg:col-span-7 space-y-6">
            {/* Student Count Adjustment */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-800">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-neutral-900">Student Cohort Sizing</h2>
                </div>
                {!isLocked && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Interactive Sizing
                  </span>
                )}
              </div>

              {!isLocked ? (
                <div className="space-y-4 pt-1">
                  <p className="text-xs text-neutral-600">
                    Adjust the expected student batch size below. Live commercial investment calculations update in real time.
                  </p>
                  <GenesisStepper
                    value={studentCount}
                    min={proposalData.minStudents || 10}
                    max={proposalData.maxStudents || 2000}
                    step={10}
                    onChange={(val) => setStudentCount(val)}
                    presets={[100, 150, 200, 300, 500]}
                  />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-600">Enrolled Student Cohort</span>
                  <span className="font-mono text-base font-black text-neutral-900">
                    {studentCount} Students
                  </span>
                </div>
              )}
            </Card>

            {/* Curriculum Scope & Modules */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-neutral-900">
                    {isCustomPlan
                      ? `Custom Plan Architecture (${livePricing?.totalTrainingHours || proposalData.totalHours} hrs)`
                      : 'Curriculum Scope & Training Modules'}
                  </h2>
                </div>
                {isCustomPlan && (
                  <span className="text-[10px] font-bold font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Modular Curriculum
                  </span>
                )}
              </div>

              {isCustomPlan && livePricing?.computedPrograms ? (
                <div className="space-y-2.5 pt-1">
                  {livePricing.computedPrograms.map((prog, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <div>
                          <span className="font-bold text-neutral-900 block">{prog.name}</span>
                          <span className="text-[10px] text-amber-800 font-mono font-medium">
                            {prog.pricingType === 'PER_STUDENT' ? `₹${prog.unitRate}/std` : `₹${prog.unitRate}/hr`} (Locked Rate)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        {!isLocked ? (
                          <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-lg p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleProgramHoursChange(idx, prog.hours - 5)}
                              disabled={prog.hours <= 1}
                              className="w-6 h-6 flex items-center justify-center rounded text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                              title="Decrease 5 Hours"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="500"
                              value={prog.hours}
                              onChange={(e) => handleProgramHoursChange(idx, parseInt(e.target.value) || 1)}
                              className="w-12 text-center font-mono font-bold text-xs bg-transparent focus:outline-none"
                            />
                            <span className="text-[10px] text-neutral-500 font-semibold pr-1">hrs</span>
                            <button
                              type="button"
                              onClick={() => handleProgramHoursChange(idx, prog.hours + 5)}
                              className="w-6 h-6 flex items-center justify-center rounded text-neutral-700 hover:bg-neutral-100 font-bold"
                              title="Increase 5 Hours"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono text-neutral-600 font-bold">{prog.hours} hrs</span>
                        )}

                        <span className="font-mono font-bold text-neutral-900 shrink-0 min-w-[75px] text-right">
                          {formatINR(prog.cost)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-xs font-bold text-neutral-900 px-1">
                    <span>Custom Training Total ({livePricing.totalTrainingHours} hrs):</span>
                    <span className="font-mono text-amber-900 text-sm">
                      {formatINR(livePricing.baseTrainingCost)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {proposalData.plan?.modules?.map((mod, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-2.5 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="font-medium text-neutral-900">{mod.name}</span>
                      </div>
                      <span className="font-mono text-neutral-500 font-semibold text-[11px] whitespace-nowrap">
                        {mod.hours}h
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Custom Proposal Items */}
            {livePricing?.computedCustomItems && livePricing.computedCustomItems.length > 0 && (
              <Card className="space-y-4 border-purple-200/80 bg-purple-50/20">
                <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-100 text-purple-900">
                      <Package className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-neutral-900">Custom Proposal Items</h2>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                    Specialized Requirements
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {livePricing.computedCustomItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-purple-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div>
                        <span className="font-bold text-neutral-900 block">{item.name}</span>
                        {item.description && (
                          <p className="text-[10px] text-neutral-500 mt-0.5">{item.description}</p>
                        )}
                        <span className="text-[10px] text-purple-800 font-mono font-medium block mt-0.5">
                          {item.pricingType === 'PER_STUDENT'
                            ? `₹${item.unitPrice}/student (${item.quantity} students)`
                            : `₹${item.unitPrice} × ${item.quantity}`}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-purple-950 text-sm">
                        {formatINR(item.calculatedCost)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-purple-200 flex justify-between items-center text-xs font-bold text-neutral-900 px-1">
                    <span>Custom Items Total:</span>
                    <span className="font-mono text-purple-900 text-sm">
                      {formatINR(livePricing.customItemsTotal)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Commercial Add-ons */}
            {proposalData.availableAddons && proposalData.availableAddons.length > 0 && (
              <Card className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-800">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-neutral-900">Institutional Add-ons & Certifications</h2>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {selectedAddonIds.length} Selected
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {proposalData.availableAddons.map((addon) => {
                    const isSelected = selectedAddonIds.includes(addon.id);

                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleAddonToggle(addon.id)}
                        className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                          isSelected
                            ? 'bg-amber-50/50 border-amber-400 shadow-xs'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        } ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500 text-neutral-950'
                                : 'border-neutral-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-neutral-900">{addon.name}</span>
                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                              {addon.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end text-right flex-shrink-0">
                          <span className="text-xs font-bold font-mono text-neutral-900">
                            {formatINR(addon.price)}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {addon.pricingType === 'PER_STUDENT'
                              ? 'per student'
                              : addon.pricingType === 'PER_HOUR'
                              ? 'per hour'
                              : 'flat fee'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* College Notes */}
            {!isLocked && (
              <Card className="space-y-3">
                <label className="text-xs font-bold text-neutral-900 block">
                  Institutional Notes / Custom Requirements
                </label>
                <textarea
                  value={collegeNotes}
                  onChange={(e) => setCollegeNotes(e.target.value)}
                  placeholder="Provide batch commencement dates, scheduling preferences, or specific remarks..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </Card>
            )}
          </div>

          {/* Right Column: Live Financials & Submission */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24 space-y-6">
              <Card className="border-amber-300/80 shadow-md bg-white space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Commercial Investment Summary</h3>
                    <p className="text-[10px] text-neutral-500">Transparent line-item breakdown</p>
                  </div>
                </div>

                {livePricing ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>Base Training Curriculum:</span>
                      <span className="font-mono font-semibold text-neutral-800">
                        {formatINR(livePricing.baseTrainingCost)}
                      </span>
                    </div>

                    {livePricing.addonsTotal > 0 && (
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Selected Add-ons:</span>
                        <span className="font-mono font-semibold text-neutral-800">
                          {formatINR(livePricing.addonsTotal)}
                        </span>
                      </div>
                    )}

                    {livePricing.customItemsTotal > 0 && (
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Custom Proposal Items:</span>
                        <span className="font-mono font-semibold text-purple-900">
                          {formatINR(livePricing.customItemsTotal)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-neutral-800 font-semibold pt-1 border-t border-neutral-100">
                      <span>Subtotal:</span>
                      <span className="font-mono">
                        {formatINR(livePricing.subtotal)}
                      </span>
                    </div>

                    {livePricing.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-emerald-800 font-semibold bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <span>Institutional Subsidy / Discount:</span>
                        <span className="font-mono font-bold">-{formatINR(livePricing.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-neutral-900 font-bold">
                      <span>Taxable Amount (Pre-GST):</span>
                      <span className="font-mono">{formatINR(livePricing.taxableAmount)}</span>
                    </div>

                    <div className="flex items-center justify-between text-amber-900 bg-amber-50/80 px-2.5 py-1.5 rounded-lg font-semibold border border-amber-200/60">
                      <span>Cost Per Student — Before GST:</span>
                      <span className="font-mono font-bold text-sm">
                        {formatINR(livePricing.costPerStudentBeforeGst)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-700">
                      <span className="flex items-center gap-1">
                        Goods & Services Tax
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          GST 18%
                        </span>
                      </span>
                      <span className="font-mono font-semibold text-neutral-900">
                        {formatINR(livePricing.gstAmount)}
                      </span>
                    </div>

                    <div className="pt-3 border-t-2 border-amber-400/80 flex items-center justify-between text-base font-black text-neutral-950 bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-2.5 rounded-xl">
                      <span>Grand Total (Incl. GST):</span>
                      <span className="font-mono text-xl text-amber-900 font-black">
                        {formatINR(livePricing.grandTotal)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-neutral-400">
                    Calculating commercial totals...
                  </div>
                )}

                {/* Genesis Digital Approval Certificate Card */}
                {proposalData.digitalApproval && (
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-xs space-y-2.5 text-amber-950">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                      <div className="flex items-center gap-1.5 font-black uppercase text-[10px] tracking-wider text-amber-900">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Genesis Digital Approval</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[9px] font-black uppercase tracking-wider">
                        v{proposalData.digitalApproval.proposalVersion}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-amber-800 font-medium">Approval Reference:</span>
                        <span className="font-mono font-bold text-amber-950">{proposalData.digitalApproval.approvalId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-800 font-medium">Approved By:</span>
                        <span className="font-bold text-amber-950">{proposalData.digitalApproval.approvedByName || 'BD Manager'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-800 font-medium">Role:</span>
                        <span className="font-semibold text-amber-950">BD Manager</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-800 font-medium">Approved On:</span>
                        <span className="font-semibold text-amber-950">{formatDateTime(proposalData.digitalApproval.approvedAt)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-amber-200/60">
                        <span className="text-amber-800 font-medium">Proposal Prepared By:</span>
                        <span className="font-semibold text-amber-950">{proposalData.createdBy?.fullName || 'BD Executive'} (BD Executive)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-800 font-medium">Document Integrity:</span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Verified & Digitally Signed
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital Acceptance Certificate Card */}
                {proposalData.digitalAcceptance && (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 text-xs space-y-2.5 text-emerald-950">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                      <div className="flex items-center gap-1.5 font-black uppercase text-[10px] tracking-wider text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Digital Acceptance Verified</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
                        v{proposalData.digitalAcceptance.proposalVersion}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-emerald-800 font-medium">Acceptance ID:</span>
                        <span className="font-mono font-bold text-emerald-950">{proposalData.digitalAcceptance.acceptanceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-800 font-medium">Accepted Plan:</span>
                        <span className="font-bold text-emerald-950">
                          {isCustomPlan
                            ? `Custom Modular Plan (${livePricing?.totalTrainingHours || proposalData.totalHours} Hours)`
                            : `${proposalData.plan?.name} Plan (${proposalData.totalHours} Hours)`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-800 font-medium">Cohort Sizing:</span>
                        <span className="font-semibold text-emerald-950">{studentCount} Students</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-800 font-medium">Accepted On:</span>
                        <span className="font-semibold text-emerald-950">{formatDate(proposalData.digitalAcceptance.acceptedAt)}</span>
                      </div>
                      {proposalData.digitalAcceptance.acceptedByName && (
                        <div className="flex justify-between">
                          <span className="text-emerald-800 font-medium">Authorized Lead:</span>
                          <span className="font-semibold text-emerald-950">{proposalData.digitalAcceptance.acceptedByName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-emerald-800 font-medium">Document Integrity:</span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Verified
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Action Bar */}
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  {!isLocked ? (
                    <div className="space-y-2">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full justify-center shadow-md font-bold"
                        isLoading={isSubmitting}
                        onClick={() => setIsConfirmAcceptModalOpen(true)}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Confirm & Submit Sizing
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center text-xs font-semibold text-neutral-700 hover:bg-neutral-50 border-neutral-300"
                        onClick={() => {
                          setChangeError(null);
                          setIsRequestChangeOpen(true);
                        }}
                        leftIcon={<MessageSquare className="w-3.5 h-3.5 text-amber-700" />}
                      >
                        Request Changes / Special Terms
                      </Button>
                    </div>
                  ) : isApproved ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Proposal Approved & Finalized</span>
                      </div>
                      <p className="text-[10px] text-emerald-700">
                        Official MoU execution is underway with Genesis Academic Relations.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                        <Clock className="w-4 h-4 text-amber-700" />
                        <span>Submitted & Pending Manager Sign-off</span>
                      </div>
                      <p className="text-[10px] text-amber-800">
                        Your proposal has been sent to the Genesis team for final approval.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-500 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cryptographically verified Genesis Institutional Document</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* College Digital Acceptance Confirmation Modal */}
      <Modal
        isOpen={isConfirmAcceptModalOpen}
        onClose={() => setIsConfirmAcceptModalOpen(false)}
        title="Confirm & Digitally Accept Proposal"
        subtitle={`Proposal Reference #${proposalData.proposalId} for ${proposalData.college?.name}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-neutral-800">
          <p className="text-neutral-600 leading-relaxed">
            Please review the commercial parameters below before digitally confirming this proposal sizing for final Genesis BD Manager sign-off.
          </p>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-neutral-500 font-medium">Student Cohort:</span>
              <span className="font-mono font-bold text-neutral-900">{studentCount} Students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-medium">Selected Plan:</span>
              <span className="font-bold text-neutral-900">
                {isCustomPlan ? `Custom Modular Plan (${livePricing?.totalTrainingHours || proposalData.totalHours} hrs)` : proposalData.plan?.name}
              </span>
            </div>
            {isCustomPlan && livePricing?.computedPrograms && (
              <div className="py-2 border-y border-neutral-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500">Configured Training Programs:</span>
                {livePricing.computedPrograms.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="text-neutral-700">{p.name} ({p.hours} hrs @ {p.pricingType === 'PER_STUDENT' ? `₹${p.unitRate}/std` : `₹${p.unitRate}/hr`}):</span>
                    <span className="font-mono font-semibold text-neutral-900">{formatINR(p.cost)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500 font-medium">Selected Add-ons:</span>
              <span className="font-semibold text-neutral-900">
                {selectedAddonIds.length > 0
                  ? (proposalData.availableAddons || [])
                      .filter((a) => selectedAddonIds.includes(a.id))
                      .map((a) => a.name)
                      .join(', ')
                  : 'None'}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex justify-between">
              <span className="text-neutral-600 font-medium">Taxable Amount (Pre-GST):</span>
              <span className="font-mono font-bold text-neutral-900">{formatINR(livePricing?.taxableAmount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-medium">Goods & Services Tax (GST 18%):</span>
              <span className="font-mono font-bold text-neutral-900">{formatINR(livePricing?.gstAmount || 0)}</span>
            </div>
            <div className="pt-2 border-t-2 border-amber-400 flex justify-between bg-amber-500/10 -mx-4 -mb-4 p-3.5 rounded-b-xl">
              <span className="font-extrabold text-neutral-950">Grand Total (Incl. GST):</span>
              <span className="font-mono font-black text-amber-900 text-base">
                {formatINR(livePricing?.grandTotal || 0)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              By clicking "Confirm & Accept", a digitally verified acceptance record and cryptographic hash will be generated.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmAcceptModalOpen(false)}
              disabled={isSubmitting}
            >
              Back & Adjust
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 font-bold"
              isLoading={isSubmitting}
              onClick={handleSaveAndSubmit}
              leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
            >
              Confirm & Accept
            </Button>
          </div>
        </div>
      </Modal>

      {/* College Request Changes Modal */}
      <Modal
        isOpen={isRequestChangeOpen}
        onClose={() => setIsRequestChangeOpen(false)}
        title="Request Proposal Changes / Custom Terms"
        subtitle="Your request will be dispatched directly to the Genesis BD representative assigned to your campus"
        maxWidth="lg"
      >
        {changeError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{changeError}</span>
          </div>
        )}

        <form onSubmit={handleRequestChanges} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Requested Modifications / Notes for Genesis BD Team *
            </label>
            <textarea
              required
              rows={4}
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g. We would like to add an additional 10 hours for Mock Interviews, adjust batch timings to afternoon slots, or explore tailored commercial terms..."
              className="w-full text-xs p-3.5 rounded-xl border border-neutral-300 bg-white focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Submitting this request will flag the proposal as <strong>Revisions Requested</strong> and immediately notify your assigned BD executive to update the curriculum, schedule, or pricing snapshot.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRequestChangeOpen(false)}
              disabled={isRequestingChange}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isRequestingChange}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            >
              Submit Change Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
