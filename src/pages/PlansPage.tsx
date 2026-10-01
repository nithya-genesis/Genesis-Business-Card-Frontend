import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plan } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatCurrency } from '../utils/formatters';
import { Layers, Plus, Edit2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const PlansPage: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isPrivileged = user?.role === 'SYSTEM_ADMIN' || user?.role === 'BD_MANAGER';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    totalHours: 48,
    pricingModel: 'HOURLY' as 'HOURLY' | 'FIXED_PLAN' | 'CUSTOM',
    fixedPrice: 0,
    modules: [] as { name: string; hours: number }[],
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleHours, setNewModuleHours] = useState(10);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/plans', {
        params: { includeInactive: isPrivileged ? 'true' : 'false' },
      });
      if (res.data.success) {
        const rawList = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.plans || []);
        setPlans(rawList);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [isPrivileged]);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      totalHours: 48,
      pricingModel: 'HOURLY',
      fixedPrice: 0,
      modules: [
        { name: 'Soft Skills & Corporate Readiness', hours: 12 },
        { name: 'Quantitative Aptitude & Logical Reasoning', hours: 18 },
        { name: 'Verbal Ability & Communicative English', hours: 10 },
        { name: 'Technical Problem Solving', hours: 8 },
      ],
      status: 'ACTIVE',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      description: plan.description,
      totalHours: plan.totalHours,
      pricingModel: plan.pricingModel as any,
      fixedPrice: plan.fixedPrice || 0,
      modules: (plan.modules || []).map((m) => ({ name: m.name, hours: m.hours })),
      status: ((plan as any).status || 'ACTIVE') as any,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleAddModule = () => {
    if (!newModuleName.trim()) return;
    setFormData({
      ...formData,
      modules: [...formData.modules, { name: newModuleName.trim(), hours: newModuleHours }],
      totalHours: formData.totalHours + newModuleHours,
    });
    setNewModuleName('');
    setNewModuleHours(10);
  };

  const handleRemoveModule = (index: number) => {
    const removedHours = formData.modules[index]?.hours || 0;
    setFormData({
      ...formData,
      modules: formData.modules.filter((_, idx) => idx !== index),
      totalHours: Math.max(0, formData.totalHours - removedHours),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    const calculatedTotalHours = formData.modules.length > 0
      ? formData.modules.reduce((sum, m) => sum + (m.hours || 0), 0)
      : formData.totalHours;

    const payload = {
      name: formData.name.trim(),
      code: (formData.code || formData.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')).trim(),
      description: formData.description.trim(),
      totalHours: Number(calculatedTotalHours),
      pricingModel: formData.pricingModel,
      fixedPrice: formData.pricingModel === 'FIXED_PLAN' ? Number(formData.fixedPrice) : undefined,
      modules: formData.modules.map((m, idx) => ({
        name: m.name,
        hours: Number(m.hours),
        displayOrder: idx,
      })),
      status: formData.status,
    };

    try {
      if (editingPlan) {
        await apiClient.put(`/plans/${editingPlan.id}`, payload);
      } else {
        await apiClient.post('/plans', payload);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save curriculum plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    const currentStatus = (plan as any).status || 'ACTIVE';
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to set plan "${plan.name}" to ${newStatus}?`)) {
      return;
    }
    try {
      await apiClient.put(`/plans/${plan.id}`, { status: newStatus });
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update plan status');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center text-neutral-500 text-xs font-semibold">
        Loading curriculum training catalog...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500" />
            Training Curriculum Packages Master
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Curated campus recruitment training modules with standardized institutional hourly pricing
          </p>
        </div>

        {isPrivileged && (
          <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Create Plan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPremium = plan.code === 'PREMIUM';
          const isActive = (plan as any).status !== 'INACTIVE';

          return (
            <Card
              key={plan.id}
              hoverEffect
              className={`flex flex-col justify-between relative bg-white ${
                isPremium ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-neutral-200'
              } ${!isActive ? 'opacity-60 bg-neutral-50 border-dashed' : ''}`}
            >
              {isPremium && (
                <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  Flagship Program
                </span>
              )}

              <div>
                <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{plan.name} Plan</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                        {plan.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                            : 'text-neutral-600 bg-neutral-100 border-neutral-300'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-neutral-900 font-mono">
                      {plan.totalHours}h
                    </span>
                    <span className="text-[10px] text-neutral-400 block font-medium">Total Hours</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 my-4 leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block">
                    Curriculum Modules Breakdown
                  </span>
                  {(plan.modules || []).map((m) => (
                    <div
                      key={m.id || m.name}
                      className="p-2 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-neutral-800">{m.name}</span>
                      <span className="font-mono font-bold text-neutral-900">{m.hours} Hours</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-neutral-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-medium block">Commercial Model</span>
                    <span className="text-xs font-bold text-neutral-900 font-mono">
                      {plan.pricingModel === 'FIXED_PLAN' ? `Fixed ₹${plan.fixedPrice}` : 'Standard Hourly Rate'}
                    </span>
                  </div>
                </div>

                {isPrivileged && (
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(plan)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      className="flex-1 text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      variant={isActive ? 'destructive' : 'success'}
                      size="sm"
                      onClick={() => handleToggleStatus(plan)}
                      className="text-xs px-2.5"
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPlan ? 'Edit Curriculum Plan' : 'Create New Curriculum Plan'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Plan Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Advanced Placement Master Plan"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Plan Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ADVANCED"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Pricing Model</label>
                <select
                  value={formData.pricingModel}
                  onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value as any })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="HOURLY">Hourly Rate Model</option>
                  <option value="FIXED_PLAN">Fixed Price Package</option>
                  <option value="CUSTOM">Custom Modular</option>
                </select>
              </div>
            </div>

            {formData.pricingModel === 'FIXED_PLAN' && (
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Fixed Package Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.fixedPrice}
                  onChange={(e) => setFormData({ ...formData, fixedPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Description *</label>
              <textarea
                rows={2}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Institutional target, curriculum duration, and placement outcomes..."
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Modules List */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="block text-xs font-bold text-neutral-800">Curriculum Modules</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {formData.modules.map((m, idx) => (
                  <div key={idx} className="p-2 bg-neutral-50 rounded-lg flex items-center justify-between text-xs border border-neutral-200">
                    <span className="font-semibold text-neutral-800">{m.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-neutral-900">{m.hours}h</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(idx)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Module Name (e.g. Verbal Ability)"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  className="flex-1 bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Hrs"
                  value={newModuleHours}
                  onChange={(e) => setNewModuleHours(parseInt(e.target.value, 10) || 1)}
                  className="w-16 bg-white border border-neutral-300 rounded-lg px-2 py-1.5 text-xs text-neutral-900 font-mono text-center"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddModule}>
                  Add
                </Button>
              </div>
            </div>

            {editingPlan && (
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Catalog Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="ACTIVE">ACTIVE (Available for new proposals)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from selection)</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                {editingPlan ? 'Save Changes' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PlansPage;
