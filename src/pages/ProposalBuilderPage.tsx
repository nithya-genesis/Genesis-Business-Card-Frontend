import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams, NavLink } from 'react-router-dom';
import { apiClient } from '../api/client';
import {
  College,
  Plan,
  Addon,
  TrainingProgram,
  CustomProgramSelection,
  CustomItem,
  PricingCalculationResult,
} from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { GenesisStepper } from '../components/common/GenesisStepper';
import { PlanComparisonModal } from '../components/common/PlanComparisonModal';
import { LivePriceSummary } from '../components/common/LivePriceSummary';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';
import {
  Building2,
  Layers,
  Users,
  PackagePlus,
  FileCheck2,
  Share2,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  QrCode,
  Copy,
  ExternalLink,
  AlertCircle,
  PlusCircle,
  Download,
  BookOpen,
  Trash2,
  Plus,
  Sliders,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STEPS = [
  { id: 1, title: 'Select College', icon: Building2 },
  { id: 2, title: 'Training Plan', icon: Layers },
  { id: 3, title: 'Batch & Rate', icon: Users },
  { id: 4, title: 'Add-ons & Custom', icon: PackagePlus },
  { id: 5, title: 'Review & Verify', icon: FileCheck2 },
  { id: 6, title: 'Share & QR', icon: Share2 },
];

export const ProposalBuilderPage: React.FC = () => {
  const { user } = useAuth();
  const { id: routeProposalId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const editProposalId = routeProposalId || searchParams.get('editProposalId');
  const isEditMode = Boolean(editProposalId);

  const preselectedCollegeId = searchParams.get('collegeId');
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [colleges, setColleges] = useState<College[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [trainingCatalog, setTrainingCatalog] = useState<TrainingProgram[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Proposal State
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(preselectedCollegeId || '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isCustomPlan, setIsCustomPlan] = useState<boolean>(false);
  const [customPrograms, setCustomPrograms] = useState<CustomProgramSelection[]>([]);

  const [studentCount, setStudentCount] = useState<number>(150);
  const [minStudents, setMinStudents] = useState<number>(50);
  const [maxStudents, setMaxStudents] = useState<number>(1500);
  const [pricingModel, setPricingModel] = useState<'HOURLY' | 'FIXED_PLAN' | 'CUSTOM'>('HOURLY');
  const [hourlyRate, setHourlyRate] = useState<number>(40);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Custom Proposal Items
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [newCustomItem, setNewCustomItem] = useState<{
    name: string;
    description: string;
    quantity: number;
    pricingType: 'PER_STUDENT' | 'FLAT' | 'PER_UNIT';
    unitPrice: number;
  }>({
    name: '',
    description: '',
    quantity: 150,
    pricingType: 'PER_STUDENT',
    unitPrice: 200,
  });

  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Server Calculated Price State
  const [calculation, setCalculation] = useState<PricingCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Final Created Proposal
  const [createdProposal, setCreatedProposal] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Initial Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegesRes, plansRes, addonsRes, programsRes, settingsRes] = await Promise.all([
          apiClient.get('/colleges?limit=100'),
          apiClient.get('/plans'),
          apiClient.get('/addons'),
          apiClient.get('/programs'),
          apiClient.get('/settings/DEFAULT_HOURLY_RATE'),
        ]);

        if (collegesRes.data.success) {
          setColleges(collegesRes.data.data.colleges);
          if (preselectedCollegeId) {
            const found = collegesRes.data.data.colleges.find((c: College) => c.id === preselectedCollegeId);
            if (found) {
              setSelectedCollegeId(found.id);
              setStudentCount(found.studentCount || 150);
            }
          }
        }

        if (plansRes.data.success) {
          setPlans(plansRes.data.data);
          if (plansRes.data.data.length > 0) {
            const defaultPlan = plansRes.data.data.find((p: Plan) => p.code === 'STANDARD') || plansRes.data.data[0];
            setSelectedPlanId(defaultPlan.id);
          }
        }

        if (addonsRes.data.success) {
          setAddons(addonsRes.data.data);
        }

        if (programsRes.data.success) {
          const rawPrograms = Array.isArray(programsRes.data.data)
            ? programsRes.data.data
            : (programsRes.data.data?.programs || []);
          setTrainingCatalog(rawPrograms);
          setCustomPrograms([]);
        }

        if (settingsRes.data.success && settingsRes.data.data?.value) {
          setHourlyRate(parseFloat(settingsRes.data.data.value) || 40);
        }

        // If in Edit Mode, fetch and prefill the existing proposal details
        if (editProposalId) {
          const propRes = await apiClient.get(`/proposals/${editProposalId}`);
          if (propRes.data.success) {
            const prop = propRes.data.data;
            setSelectedCollegeId(prop.collegeId);
            setStudentCount(prop.studentCount);
            setMinStudents(prop.minStudents || 50);
            setMaxStudents(prop.maxStudents || 1500);
            setHourlyRate(prop.hourlyRateSnapshot || 40);
            setPricingModel(prop.pricingModelSnapshot || 'HOURLY');
            setSelectedAddonIds(prop.addons?.map((a: any) => a.addonId) || []);
            setCustomItems(
              prop.customItems?.map((ci: any) => ({
                name: ci.name,
                description: ci.description || '',
                quantity: ci.quantity,
                pricingType: ci.pricingType,
                unitPrice: ci.unitPrice,
                totalCost: ci.calculatedCost,
              })) || []
            );
            setDiscountType(prop.discountType || 'FIXED');
            setDiscountValue(prop.discountValue || 0);
            setNotes(prop.notes || '');

            if (prop.plan?.code === 'CUSTOM' || prop.customProgramsData || prop.customPrograms || prop.planType === 'CUSTOM') {
              setIsCustomPlan(true);
              let parsedProgs = [];
              try {
                parsedProgs = typeof prop.customProgramsData === 'string'
                  ? JSON.parse(prop.customProgramsData)
                  : (prop.customPrograms || prop.customProgramsData || []);
              } catch {
                parsedProgs = [];
              }
              setCustomPrograms(parsedProgs);
            } else {
              setSelectedPlanId(prop.planId);
              setIsCustomPlan(false);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load initial builder data:', err);
      }
    };

    fetchData();
  }, [preselectedCollegeId, editProposalId]);

  // Recalculate Live Pricing on parameter change
  useEffect(() => {
    if ((!selectedPlanId && !isCustomPlan) || studentCount <= 0) return;

    const recalculate = async () => {
      setIsCalculating(true);
      try {
        const payload = {
          planId: isCustomPlan ? undefined : selectedPlanId,
          planType: isCustomPlan ? 'CUSTOM' : undefined,
          customPrograms: isCustomPlan ? customPrograms : undefined,
          customProgramsData: isCustomPlan ? customPrograms : undefined,
          customItems: customItems.length > 0 ? customItems : undefined,
          studentCount,
          hourlyRate: pricingModel === 'CUSTOM' ? hourlyRate : undefined,
          pricingModel: isCustomPlan ? 'CUSTOM' : pricingModel,
          selectedAddonIds,
          discountType,
          discountValue,
        };
        const res = await apiClient.post('/proposals/calculate', payload);
        if (res.data.success) {
          setCalculation(res.data.data);
        }
      } catch (err) {
        console.error('Calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    const debounce = setTimeout(() => {
      recalculate();
    }, 150);

    return () => clearTimeout(debounce);
  }, [
    selectedPlanId,
    isCustomPlan,
    customPrograms,
    customItems,
    studentCount,
    hourlyRate,
    pricingModel,
    selectedAddonIds,
    discountType,
    discountValue,
  ]);

  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleToggleCustomProgram = (program: TrainingProgram) => {
    setCustomPrograms((prev) => {
      const exists = prev.find((p) => p.programId === program.id);
      if (exists) {
        return prev.filter((p) => p.programId !== program.id);
      } else {
        const progHours = (program as any).hours ?? program.defaultHours ?? 10;
        const progRate = (program as any).rate ?? (program as any).defaultPrice ?? (program.pricingType === 'PER_STUDENT' ? (program.defaultPerStudentRate || 200) : (program.defaultHourlyRate || 2500));
        return [
          ...prev,
          {
            programId: program.id,
            programName: program.name,
            name: program.name,
            code: program.code,
            hours: progHours,
            pricingType: program.pricingType,
            rate: progRate,
            unitRate: progRate,
          },
        ];
      }
    });
  };

  const handleUpdateCustomProgramHours = (programId: string, hours: number) => {
    setCustomPrograms((prev) =>
      prev.map((p) => (p.programId === programId ? { ...p, hours: Math.max(1, hours) } : p))
    );
  };

  const handleUpdateCustomProgramRate = (programId: string, rate: number) => {
    setCustomPrograms((prev) =>
      prev.map((p) => (p.programId === programId ? { ...p, unitRate: Math.max(0, rate) } : p))
    );
  };

  const handleAddCustomItem = () => {
    if (!newCustomItem.name.trim()) return;
    const item: CustomItem = {
      name: newCustomItem.name.trim(),
      description: newCustomItem.description.trim(),
      quantity: newCustomItem.quantity || studentCount,
      pricingType: newCustomItem.pricingType,
      unitPrice: newCustomItem.unitPrice || 0,
      totalCost:
        newCustomItem.pricingType === 'PER_STUDENT'
          ? (newCustomItem.unitPrice || 0) * studentCount
          : (newCustomItem.unitPrice || 0) * (newCustomItem.quantity || 1),
    };
    setCustomItems([...customItems, item]);
    setNewCustomItem({
      name: '',
      description: '',
      quantity: studentCount,
      pricingType: 'PER_STUDENT',
      unitPrice: 200,
    });
  };

  const handleRemoveCustomItem = (index: number) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    setErrorMessage(null);
    if (currentStep === 1 && !selectedCollegeId) {
      setErrorMessage('Please select a college to continue');
      return;
    }
    if (currentStep === 2 && !selectedPlanId && !isCustomPlan) {
      setErrorMessage('Please select a curriculum training plan');
      return;
    }
    if (currentStep === 2 && isCustomPlan && customPrograms.length === 0) {
      setErrorMessage('Please select at least one modular training program for the Custom Plan');
      return;
    }
    if (currentStep === 3 && studentCount < 1) {
      setErrorMessage('Student count must be at least 1');
      return;
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSaveAndGenerateProposal = async () => {
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const customPlanEntity = plans.find((p) => p.code === 'CUSTOM');
      const finalPlanId = isCustomPlan
        ? (customPlanEntity?.id || selectedPlanId)
        : selectedPlanId;

      const payload = {
        collegeId: selectedCollegeId,
        planId: finalPlanId,
        planType: isCustomPlan ? 'CUSTOM' : undefined,
        customPrograms: isCustomPlan ? customPrograms : undefined,
        customProgramsData: isCustomPlan ? customPrograms : undefined,
        customItems: customItems.length > 0 ? customItems : undefined,
        studentCount,
        minStudents,
        maxStudents,
        hourlyRate: pricingModel === 'CUSTOM' ? hourlyRate : undefined,
        pricingModel: isCustomPlan ? 'CUSTOM' : pricingModel,
        selectedAddonIds,
        discountType,
        discountValue,
        notes,
      };

      const res = isEditMode && editProposalId
        ? await apiClient.put(`/proposals/${editProposalId}`, payload)
        : await apiClient.post('/proposals', payload);

      if (res.data.success) {
        const proposal = res.data.data;
        setCreatedProposal(proposal);
        setCurrentStep(6);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || (isEditMode ? 'Failed to update proposal' : 'Failed to generate proposal'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPublicLink = () => {
    if (createdProposal?.publicToken) {
      const url = `${window.location.origin}/proposal/view/${createdProposal.publicToken}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadQrPng = async () => {
    if (createdProposal?.id) {
      try {
        const response = await apiClient.get(`/proposals/${createdProposal.id}/qr/download`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'image/png' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Genesis-Proposal-QR-${createdProposal.proposalNumber || createdProposal.proposalId}.png`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download QR code blob:', err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Proposal Generation Wizard
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Build tailored institutional placement training proposals with instant dynamic pricing
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCompareModalOpen(true)}
          leftIcon={<Layers className="w-4 h-4 text-amber-600" />}
        >
          Compare Curriculum Plans
        </Button>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {STEPS.map((step) => {
          const isCurrent = currentStep === step.id;
          const isPassed = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                isCurrent
                  ? 'border-amber-400 bg-amber-50 text-neutral-950 font-bold shadow-sm'
                  : isPassed
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold'
                  : 'border-neutral-200 bg-white text-neutral-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isPassed
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
              </div>
              <span className="text-xs truncate">{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Step Contents Layout with Live Pricing Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Step Body */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: SELECT COLLEGE */}
          {currentStep === 1 && (
            <Card className="space-y-5">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Step 1: Select Target Institution</h2>
                  <p className="text-xs text-neutral-500">Choose the partner college for this commercial proposal</p>
                </div>
                <NavLink to="/colleges" className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Register New
                </NavLink>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-800">
                  Search & Select College
                </label>
                <select
                  value={selectedCollegeId}
                  onChange={(e) => {
                    setSelectedCollegeId(e.target.value);
                    const col = colleges.find((c) => c.id === e.target.value);
                    if (col) setStudentCount(col.studentCount || 150);
                  }}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">— Select an Institution —</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.collegeId}) — {c.city}, {c.state}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCollege && (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-medium">Placement Officer:</span>
                    <span className="font-bold text-neutral-900">{selectedCollege.placementOfficerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-medium">Contact Email:</span>
                    <span className="text-amber-800 font-semibold">{selectedCollege.placementOfficerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-medium">Location:</span>
                    <span className="text-neutral-700">{selectedCollege.city}, {selectedCollege.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-medium">Registered Batch Size:</span>
                    <span className="font-mono font-bold text-neutral-900">{selectedCollege.studentCount} Students</span>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* STEP 2: SELECT TRAINING PLAN */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Step 2: Select Training Plan Curriculum</h2>
                <p className="text-xs text-neutral-500">Choose a standard package or configure a bespoke Custom Modular Plan</p>
              </div>

              {/* Plan Choice Cards (Base, Standard, Premium, Custom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.filter((p) => p.code !== 'CUSTOM').map((plan) => {
                  const isSelected = !isCustomPlan && selectedPlanId === plan.id;
                  const isPremium = plan.code === 'PREMIUM';

                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setIsCustomPlan(false);
                        setSelectedPlanId(plan.id);
                      }}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-400/30'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                      }`}
                    >
                      {isPremium && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[9px] font-black uppercase tracking-wider shadow-sm">
                          Popular
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-neutral-900">{plan.name}</h3>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                            {plan.totalHours}h
                          </span>
                        </div>

                        <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2">
                          {plan.description}
                        </p>

                        <div className="mt-3 pt-2 border-t border-neutral-100 space-y-1 text-xs text-neutral-700">
                          {plan.modules?.map((m) => (
                            <div key={m.id} className="flex justify-between text-[10px]">
                              <span className="text-neutral-500 truncate max-w-[90px]">{m.name}</span>
                              <span className="font-mono font-semibold text-neutral-900">{m.hours}h</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold">Standard</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-neutral-950'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 4th Plan Option: Custom Plan */}
                <div
                  onClick={() => {
                    setIsCustomPlan(true);
                  }}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                    isCustomPlan
                      ? 'border-purple-500 bg-purple-50/50 shadow-md ring-2 ring-purple-400/30'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                    Modular
                  </span>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-900">Custom Plan</h3>
                      <span className="text-[10px] font-bold text-purple-900 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded-full">
                        {customPrograms.reduce((acc, p) => acc + (p.hours || 0), 0)}h Total
                      </span>
                    </div>

                    <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2">
                      Bespoke curriculum assembled from individual training modules & workshops.
                    </p>

                    <div className="mt-3 pt-2 border-t border-neutral-100 space-y-1">
                      <span className="text-[10px] font-bold text-purple-900">
                        {customPrograms.length} Selected Programs
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] text-purple-700 font-bold uppercase">Bespoke</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isCustomPlan
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      {isCustomPlan && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Modular Program Selector if Custom Plan is chosen */}
              {isCustomPlan && (
                <Card className="p-5 border-purple-200 bg-purple-50/20 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        Configure Modular Training Curriculum
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Select programs from Genesis catalog and adjust specific hours and rates.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-900">
                      {customPrograms.reduce((sum, p) => sum + (p.hours || 0), 0)} Hours Total
                    </span>
                  </div>

                  {!trainingCatalog || trainingCatalog.length === 0 ? (
                    <div className="p-6 text-center bg-white rounded-xl border border-neutral-200">
                      <BookOpen className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-neutral-700">No training programs currently configured in catalog.</p>
                      <p className="text-[11px] text-neutral-400 mt-1">Please contact your administrator or manager to add modules to the program catalog.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trainingCatalog.map((prog) => {
                        const selected = customPrograms.find((p) => p.programId === prog.id);
                        const isChecked = !!selected;

                        return (
                          <div
                            key={prog.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isChecked
                                ? 'bg-white border-purple-300 shadow-sm'
                                : 'bg-neutral-50/60 border-neutral-200 opacity-75'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCustomProgram(prog)}
                                className="mt-1 w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500 cursor-pointer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-neutral-900">{prog.name}</span>
                                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                    {prog.code}
                                  </span>
                                </div>
                                <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                                  {prog.description}
                                </p>
                              </div>
                            </div>

                            {isChecked && (
                              <div className="flex items-center gap-3 pl-7 sm:pl-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-neutral-500 font-medium">Hours:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={selected.hours}
                                    onChange={(e) =>
                                      handleUpdateCustomProgramHours(prog.id, parseInt(e.target.value, 10) || 0)
                                    }
                                    className="w-16 bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs text-neutral-900 font-mono text-center"
                                  />
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-neutral-500 font-medium">
                                    {selected.pricingType === 'PER_STUDENT' ? '₹/Student:' : '₹/Hr:'}
                                  </span>
                                  {user?.role === 'SYSTEM_ADMIN' || user?.role === 'BD_MANAGER' ? (
                                    <input
                                      type="number"
                                      min="0"
                                      value={selected.unitRate ?? selected.rate}
                                      onChange={(e) =>
                                        handleUpdateCustomProgramRate(prog.id, parseFloat(e.target.value) || 0)
                                      }
                                      className="w-20 bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs text-neutral-900 font-mono text-center"
                                    />
                                  ) : (
                                    <span className="w-20 bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-700 font-mono text-center block">
                                      ₹{selected.unitRate ?? selected.rate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* STEP 3: STUDENT COUNT & RATE */}
          {currentStep === 3 && (
            <Card className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Step 3: Enrollment Batch Size & Commercial Model</h2>
                <p className="text-xs text-neutral-500">Configure target student count and commercial rate strategy</p>
              </div>

              <div className="space-y-4">
                <GenesisStepper
                  value={studentCount}
                  min={minStudents}
                  max={maxStudents}
                  step={10}
                  onChange={(val) => setStudentCount(val)}
                  label="Target Batch Enrollment"
                  helperText="Use presets or custom slider to establish baseline student volume."
                />

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Minimum Permitted Limit (for College View)
                    </label>
                    <input
                      type="number"
                      value={minStudents}
                      onChange={(e) => setMinStudents(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">College cannot reduce below this</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Maximum Permitted Limit
                    </label>
                    <input
                      type="number"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(parseInt(e.target.value, 10) || 2000)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">Maximum college can increase to</span>
                  </div>
                </div>

                {!isCustomPlan && (
                  <div className="pt-4 border-t border-neutral-100 space-y-3">
                    <label className="block text-xs font-bold text-neutral-800">
                      Commercial Pricing Strategy
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPricingModel('HOURLY')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          pricingModel === 'HOURLY'
                            ? 'border-amber-400 bg-amber-50 text-neutral-950 font-semibold'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-xs font-bold block text-neutral-900">Standard Hourly</span>
                        <span className="text-[10px] text-neutral-500">System Default ₹40/hr</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPricingModel('CUSTOM')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          pricingModel === 'CUSTOM'
                            ? 'border-amber-400 bg-amber-50 text-neutral-950 font-semibold'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-xs font-bold block text-neutral-900">Custom Hourly Rate</span>
                        <span className="text-[10px] text-neutral-500">Special Rate per student/hr</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPricingModel('FIXED_PLAN')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          pricingModel === 'FIXED_PLAN'
                            ? 'border-amber-400 bg-amber-50 text-neutral-950 font-semibold'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-xs font-bold block text-neutral-900">Fixed Plan Price</span>
                        <span className="text-[10px] text-neutral-500">Lump-sum Package</span>
                      </button>
                    </div>

                    {pricingModel === 'CUSTOM' && (
                      <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 mt-3 animate-in fade-in">
                        <label className="text-xs font-bold text-neutral-800">
                          Custom Hourly Rate per Student (INR)
                        </label>
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* STEP 4: ADD-ONS & CUSTOM ITEMS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Standard Add-ons Section */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Commercial Add-on Modules</h2>
                  <p className="text-xs text-neutral-500">Select accelerator programs including Technical Skill-Up</p>
                </div>

                <div className="space-y-3">
                  {addons.map((addon) => {
                    const isSelected = selectedAddonIds.includes(addon.id);

                    let pricingDescription = '';
                    let itemCalculated = 0;
                    if (addon.pricingType === 'PER_STUDENT') {
                      pricingDescription = `₹${addon.price}/student`;
                      itemCalculated = addon.price * studentCount;
                    } else if (addon.pricingType === 'PER_HOUR') {
                      pricingDescription = `₹${addon.price}/hr`;
                      itemCalculated = addon.price * (selectedPlan?.totalHours || 60);
                    } else {
                      pricingDescription = `Flat Fee`;
                      itemCalculated = addon.price;
                    }

                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="space-y-1 max-w-[70%]">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-neutral-900">{addon.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono font-semibold">
                              {pricingDescription}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500">{addon.description}</p>
                        </div>

                        <div className="text-right flex items-center gap-4">
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-medium">Calculated Cost</span>
                            <span className="text-xs font-bold font-mono text-neutral-900">
                              {formatINR(itemCalculated)}
                            </span>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500 text-neutral-950'
                                : 'border-neutral-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Proposal Items Section */}
              <Card className="p-5 border-neutral-200 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-600" />
                      Custom Proposal Line Items
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Add proposal-specific services, industry visits, materials, or custom workshops.
                    </p>
                  </div>
                  {customItems.length > 0 && (
                    <span className="text-xs font-mono font-bold text-neutral-900">
                      {customItems.length} Item(s) Configured
                    </span>
                  )}
                </div>

                {/* List of Existing Custom Items */}
                {customItems.length > 0 && (
                  <div className="space-y-2">
                    {customItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">{item.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-mono">
                              {item.pricingType === 'PER_STUDENT'
                                ? `₹${item.unitPrice}/student (${studentCount} std)`
                                : `₹${item.unitPrice} × ${item.quantity}`}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-neutral-500 mt-0.5">{item.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-purple-950">
                            {formatINR(
                              item.pricingType === 'PER_STUDENT'
                                ? item.unitPrice * studentCount
                                : item.unitPrice * (item.quantity || 1)
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Item Form */}
                <div className="p-3.5 bg-neutral-50/70 rounded-xl border border-dashed border-neutral-300 space-y-3">
                  <span className="text-xs font-bold text-neutral-800 block">Add Custom Item</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Item Title (e.g. Industry Site Visit & Lab Kits)"
                      value={newCustomItem.name}
                      onChange={(e) => setNewCustomItem({ ...newCustomItem, name: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900"
                    />
                    <input
                      type="text"
                      placeholder="Description (Optional)"
                      value={newCustomItem.description}
                      onChange={(e) =>
                        setNewCustomItem({ ...newCustomItem, description: e.target.value })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900"
                    />
                    <select
                      value={newCustomItem.pricingType}
                      onChange={(e) =>
                        setNewCustomItem({
                          ...newCustomItem,
                          pricingType: e.target.value as any,
                        })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-medium"
                    >
                      <option value="PER_STUDENT">Per Student Rate (₹/student)</option>
                      <option value="FLAT">Flat Fee Total (₹)</option>
                      <option value="PER_UNIT">Unit Rate × Quantity</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Unit Price / Rate (₹)"
                        value={newCustomItem.unitPrice}
                        onChange={(e) =>
                          setNewCustomItem({
                            ...newCustomItem,
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddCustomItem}
                        disabled={!newCustomItem.name.trim()}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 5: REVIEW & VERIFY */}
          {currentStep === 5 && (
            <Card className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Step 5: Executive Proposal Review</h2>
                <p className="text-xs text-neutral-500">Review complete curriculum schedule, custom items, and commercial breakdown</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500 font-medium">Institution:</span>
                  <span className="font-bold text-neutral-900">{selectedCollege?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Curriculum Plan:</span>
                  <span className="font-bold text-amber-900">
                    {isCustomPlan
                      ? `Custom Plan (${customPrograms.length} programs, ${customPrograms.reduce((s, p) => s + (p.hours || 0), 0)} Hours)`
                      : `${selectedPlan?.name} Plan (${selectedPlan?.totalHours} Hours)`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Enrollment Count:</span>
                  <span className="font-mono font-bold text-neutral-900">{studentCount} Students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Selected Add-ons:</span>
                  <span className="text-neutral-800 font-semibold">{selectedAddonIds.length} modules</span>
                </div>
                {customItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-medium">Custom Items:</span>
                    <span className="text-purple-900 font-semibold">{customItems.length} custom line items</span>
                  </div>
                )}
              </div>

              {/* Special Institutional Discount Section */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <label className="text-xs font-bold text-neutral-800 block">
                  Institutional Subsidy / Discount (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 font-medium"
                    >
                      <option value="FIXED">Fixed Amount (₹)</option>
                      <option value="PERCENTAGE">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Proposal Notes */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Internal Proposal Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special milestones, batch scheduling notes..."
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </Card>
          )}

          {/* STEP 6: SHARE & QR */}
          {currentStep === 6 && (
            <Card className="space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h2 className="text-xl font-black text-neutral-900">
                  {isEditMode ? 'Proposal Successfully Revised!' : 'Proposal Successfully Generated!'}
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Proposal Reference #{createdProposal?.proposalId} (v{createdProposal?.currentVersion || 1}) is ready for client review
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-left space-y-3">
                <span className="text-[11px] font-bold text-neutral-700">Shareable Public Web Portal</span>
                <div className="flex items-center gap-2 bg-white p-1.5 pl-3 rounded-lg border border-neutral-300">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/proposal/view/${createdProposal?.publicToken}`}
                    className="bg-transparent text-xs text-neutral-800 font-mono w-full focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant={copiedLink ? 'success' : 'secondary'}
                    onClick={handleCopyPublicLink}
                  >
                    {copiedLink ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadQrPng}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download QR Code
                </Button>
                <Button
                  variant="primary"
                  onClick={() => window.open(`/proposal/view/${createdProposal?.publicToken}`, '_blank')}
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                >
                  Open Public Portal
                </Button>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <NavLink to="/proposals" className="text-xs text-amber-800 hover:text-amber-900 font-bold hover:underline">
                  Return to Proposals Overview
                </NavLink>
              </div>
            </Card>
          )}

          {/* Stepper Navigation Actions */}
          {currentStep < 6 && (
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 1}
                onClick={handlePrevStep}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Back
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextStep}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Continue to {STEPS[currentStep].title}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isSaving}
                  onClick={handleSaveAndGenerateProposal}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  {isEditMode ? 'Save Revisions & Generate Version' : 'Finalize & Generate Proposal'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Live Reactive Pricing Summary Sidebar */}
        <div className="sticky top-24">
          <LivePriceSummary
            collegeName={selectedCollege?.name}
            calculation={calculation}
            isLoading={isCalculating}
          />
        </div>
      </div>

      {/* Plan Matrix Comparison Modal */}
      <PlanComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onSelectPlan={(planId) => setSelectedPlanId(planId)}
      />
    </div>
  );
};
