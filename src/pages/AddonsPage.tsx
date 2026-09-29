import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Addon } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatINR } from '../utils/formatters';
import { PackagePlus, Sparkles, Plus, Edit2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const AddonsPage: React.FC = () => {
  const { user } = useAuth();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isPrivileged = user?.role === 'SYSTEM_ADMIN' || user?.role === 'BD_MANAGER';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    pricingType: 'PER_STUDENT' as 'PER_STUDENT' | 'PER_HOUR' | 'FIXED',
    price: 500,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const fetchAddons = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/addons', {
        params: { includeInactive: isPrivileged ? 'true' : 'false' },
      });
      if (res.data.success) {
        const rawList = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.addons || []);
        setAddons(rawList);
      }
    } catch (err) {
      console.error('Failed to load addons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, [isPrivileged]);

  const handleOpenAdd = () => {
    setEditingAddon(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      pricingType: 'PER_STUDENT',
      price: 500,
      status: 'ACTIVE',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addon: Addon) => {
    setEditingAddon(addon);
    setFormData({
      name: addon.name,
      code: addon.code,
      description: addon.description,
      pricingType: addon.pricingType as any,
      price: addon.price,
      status: (addon as any).status || 'ACTIVE',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    const payload = {
      name: formData.name.trim(),
      code: (formData.code || formData.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')).trim(),
      description: formData.description.trim(),
      pricingType: formData.pricingType,
      price: Number(formData.price),
      status: formData.status,
    };

    try {
      if (editingAddon) {
        await apiClient.put(`/addons/${editingAddon.id}`, payload);
      } else {
        await apiClient.post('/addons', payload);
      }
      setIsModalOpen(false);
      fetchAddons();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save add-on');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (addon: Addon) => {
    const currentStatus = (addon as any).status || 'ACTIVE';
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to set "${addon.name}" to ${newStatus}?`)) {
      return;
    }
    try {
      await apiClient.put(`/addons/${addon.id}`, { status: newStatus });
      fetchAddons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update add-on status');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center text-neutral-500 text-xs font-semibold">
        Loading commercial add-on catalog...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-amber-500" />
            Commercial Add-on Modules Master
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Specialized high-impact interview, coding, and assessment modules for campus recruitment drives
          </p>
        </div>

        {isPrivileged && (
          <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Create Add-on
          </Button>
        )}
      </div>

      {addons.length === 0 ? (
        <Card className="p-12 text-center bg-white border-neutral-200">
          <PackagePlus className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800">No Add-ons Configured</h3>
          <p className="text-xs text-neutral-500 mt-1">
            There are currently no commercial add-ons registered in the system.
          </p>
          {isPrivileged && (
            <Button variant="primary" size="sm" onClick={handleOpenAdd} className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
              Create First Add-on
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {addons.map((addon) => {
            let pricingText = '';
            if (addon.pricingType === 'PER_STUDENT') pricingText = 'per student';
            if (addon.pricingType === 'PER_HOUR') pricingText = 'per training hour';
            if (addon.pricingType === 'FIXED') pricingText = 'flat institutional fee';

            const isActive = (addon as any).status !== 'INACTIVE';

            return (
              <Card
                key={addon.id}
                hoverEffect
                className={`flex flex-col justify-between bg-white border-neutral-200 ${
                  !isActive ? 'opacity-60 bg-neutral-50/70 border-dashed' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {addon.code}
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

                  <h3 className="text-base font-bold text-neutral-900 mt-3">{addon.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-3">
                    {addon.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-medium block">Commercial Rate</span>
                      <span className="text-base font-black text-neutral-900 font-mono">
                        {formatINR(addon.price)}
                      </span>
                      <span className="text-[10px] text-neutral-500 block -mt-0.5">{pricingText}</span>
                    </div>
                  </div>

                  {isPrivileged && (
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(addon)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        className="flex-1 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant={isActive ? 'destructive' : 'success'}
                        size="sm"
                        onClick={() => handleToggleStatus(addon)}
                        className="text-xs px-2.5"
                        title={isActive ? 'Deactivate Add-on' : 'Activate Add-on'}
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
      )}

      {/* Create / Edit Addon Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAddon ? 'Edit Commercial Add-on' : 'Create New Commercial Add-on'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Add-on Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. 1-on-1 Mock Technical & HR Interviews"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Code / Identifier</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MOCK_INTERVIEWS"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Pricing Model *</label>
                <select
                  value={formData.pricingType}
                  onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as any })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="PER_STUDENT">Per Student (₹/student)</option>
                  <option value="PER_HOUR">Per Training Hour (₹/hr)</option>
                  <option value="FIXED">Flat Institutional Fee (₹)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Commercial Price (₹) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Comprehensive description of deliverable modules, mentors, and tools..."
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {editingAddon && (
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
                {editingAddon ? 'Save Changes' : 'Create Add-on'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AddonsPage;
