import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { TrainingProgram } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatCurrency } from '../utils/formatters';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  Code,
  Sparkles,
  Users,
  GraduationCap,
} from 'lucide-react';

export const TrainingProgramsPage: React.FC = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'APTITUDE',
    description: '',
    hours: 30,
    rate: 200,
    pricingType: 'PER_STUDENT' as 'PER_STUDENT' | 'PER_HOUR' | 'FIXED',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const isPrivileged = user?.role === 'SYSTEM_ADMIN' || user?.role === 'BD_MANAGER';

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/programs', {
        params: { includeInactive: isPrivileged ? 'true' : 'false' },
      });
      if (res.data.success) {
        const rawList = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.programs || []);
        setPrograms(rawList);
      }
    } catch (err) {
      console.error('Failed to load programs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [isPrivileged]);

  const handleOpenAdd = () => {
    setEditingProgram(null);
    setFormData({
      name: '',
      code: '',
      category: 'APTITUDE',
      description: '',
      hours: 30,
      rate: 200,
      pricingType: 'PER_STUDENT',
      status: 'ACTIVE',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (program: TrainingProgram) => {
    setEditingProgram(program);
    const progHours = (program as any).hours ?? program.defaultHours ?? 30;
    const progRate = (program as any).rate ?? (program as any).defaultPrice ?? (program.pricingType === 'PER_STUDENT' ? (program.defaultPerStudentRate || 200) : (program.defaultHourlyRate || 2500));
    setFormData({
      name: program.name,
      code: program.code,
      category: program.category || 'APTITUDE',
      description: program.description,
      hours: progHours,
      rate: progRate,
      pricingType: program.pricingType,
      status: ((program as any).status || (program.isActive ? 'ACTIVE' : 'INACTIVE')) as any,
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
      category: formData.category,
      description: formData.description.trim(),
      hours: Number(formData.hours),
      defaultHours: Number(formData.hours),
      rate: Number(formData.rate),
      defaultPrice: Number(formData.rate),
      pricingType: formData.pricingType,
      status: formData.status,
    };

    try {
      if (editingProgram) {
        await apiClient.put(`/programs/${editingProgram.id}`, payload);
      } else {
        await apiClient.post('/programs', payload);
      }
      setIsModalOpen(false);
      fetchPrograms();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save training program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (program: TrainingProgram) => {
    const isCurrentlyActive = (program as any).status === 'ACTIVE' || program.isActive;
    const action = isCurrentlyActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} "${program.name}"?`)) {
      return;
    }
    try {
      if (isCurrentlyActive) {
        await apiClient.delete(`/programs/${program.id}`);
      } else {
        await apiClient.put(`/programs/${program.id}`, { status: 'ACTIVE', isActive: true });
      }
      fetchPrograms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update program status');
    }
  };

  const filteredPrograms = (programs || []).filter((p) => {
    if (categoryFilter === 'ALL') return true;
    return p.category === categoryFilter;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'APTITUDE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Aptitude & Logic</span>;
      case 'SOFT_SKILLS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Soft Skills & Comm</span>;
      case 'TECHNICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Technical & Code</span>;
      case 'CAREER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Career Readiness</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">{cat}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center text-neutral-500 text-xs font-semibold">
        Loading modular training programs catalog...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Training Programs Catalogue
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Modular training curriculum catalog used across standard and customized college proposals.
          </p>
        </div>

        {isPrivileged && (
          <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Create Program
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
        {['ALL', 'APTITUDE', 'SOFT_SKILLS', 'TECHNICAL', 'CAREER'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              categoryFilter === cat
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {cat === 'ALL' ? 'All Programs' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filteredPrograms.length === 0 ? (
        <Card className="p-12 text-center bg-white border-neutral-200">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800">No Programs Found</h3>
          <p className="text-xs text-neutral-500 mt-1">
            There are no training programs in this category.
          </p>
          {isPrivileged && (
            <Button variant="primary" size="sm" onClick={handleOpenAdd} className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
              Create Program
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => {
            const isActive = (prog as any).status !== 'INACTIVE' && prog.isActive !== false;
            const progHours = (prog as any).hours ?? prog.defaultHours ?? 15;
            const progRate = (prog as any).rate ?? (prog as any).defaultPrice ?? (prog.pricingType === 'PER_STUDENT' ? (prog.defaultPerStudentRate || 200) : (prog.defaultHourlyRate || 2500));

            return (
              <Card
                key={prog.id}
                hoverEffect
                className={`flex flex-col justify-between bg-white border-neutral-200 ${
                  !isActive ? 'opacity-60 bg-neutral-50/70 border-dashed' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(prog.category)}
                      <span className="font-mono text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {prog.code}
                      </span>
                    </div>
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

                  <h3 className="text-base font-bold text-neutral-900 mt-3">{prog.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-3">
                    {prog.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-neutral-100 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] text-neutral-400 font-medium block">Duration</span>
                      <span className="font-mono font-bold text-neutral-900">{progHours} Hours</span>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] text-neutral-400 font-medium block">
                        {prog.pricingType === 'PER_STUDENT' ? 'Rate/Student' : prog.pricingType === 'PER_HOUR' ? 'Rate/Hour' : 'Fixed Fee'}
                      </span>
                      <span className="font-mono font-bold text-amber-900">{formatCurrency(progRate)}</span>
                    </div>
                  </div>

                  {isPrivileged && (
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(prog)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        className="flex-1 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant={isActive ? 'destructive' : 'success'}
                        size="sm"
                        onClick={() => handleToggleActive(prog)}
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
      )}

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProgram ? 'Edit Training Program' : 'Create Training Program'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Program Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Technical Skill-Up Program"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Code / Identifier *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. TECH_SKILL_UP"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="APTITUDE">Aptitude & Logic</option>
                  <option value="SOFT_SKILLS">Soft Skills & Communication</option>
                  <option value="TECHNICAL">Technical & Coding</option>
                  <option value="CAREER">Career & Interview Prep</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Duration (Hours) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value, 10) || 1 })}
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

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Rate (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Curriculum modules, syllabus coverage, and learning outcomes..."
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {editingProgram && (
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Catalog Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="ACTIVE">ACTIVE (Available in Custom Plan)</option>
                  <option value="INACTIVE">INACTIVE (Hidden from selection)</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                {editingProgram ? 'Save Changes' : 'Create Program'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TrainingProgramsPage;
