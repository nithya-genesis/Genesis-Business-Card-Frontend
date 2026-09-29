import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { apiClient } from '../api/client';
import { College } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/formatters';
import {
  Building2,
  Plus,
  Search,
  Eye,
  PlusCircle,
  MapPin,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CollegesPage: React.FC = () => {
  const { hasRole } = useAuth();
  const isManagerOrAdmin = hasRole(['BD_MANAGER', 'SYSTEM_ADMIN']);

  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Archive / Delete College Modal State
  const [deletingCollege, setDeletingCollege] = useState<College | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Create College Modal State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    placementOfficerName: '',
    placementOfficerEmail: '',
    placementOfficerPhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    studentCount: 150,
    notes: '',
  });

  const fetchColleges = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/colleges', {
        params: { page, limit: 15, search },
      });
      if (res.data.success) {
        setColleges(res.data.data.colleges);
        setTotal(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load colleges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchColleges();
    }, 200);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/colleges', formData);
      if (res.data.success) {
        setIsCreateOpen(false);
        setFormData({
          name: '',
          placementOfficerName: '',
          placementOfficerEmail: '',
          placementOfficerPhone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          studentCount: 150,
          notes: '',
        });
        fetchColleges();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create college');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingCollege) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/colleges/${deletingCollege.id}`);
      if (res.data.success) {
        setDeletingCollege(null);
        fetchColleges();
      }
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to archive college');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            Institutional Directory
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage partner colleges, universities, and placement leadership contacts
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Register New College
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-3.5 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by college name, ID (GEN-COL-...), officer, city..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>
        <div className="text-xs text-neutral-500">
          Showing <span className="font-bold text-neutral-900">{colleges.length}</span> of {total} institutions
        </div>
      </Card>

      {/* Colleges Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3.5">College ID</th>
                <th className="p-3.5">Institution Name</th>
                <th className="p-3.5">Placement Officer</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Batch Size</th>
                <th className="p-3.5">Created By</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-500">
                    Loading institutions...
                  </td>
                </tr>
              ) : colleges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-500">
                    No colleges found matching "{search}".
                  </td>
                </tr>
              ) : (
                colleges.map((col) => (
                  <tr key={col.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-800">
                      {col.collegeId}
                    </td>
                    <td className="p-3.5 font-medium text-neutral-900 max-w-[220px]">
                      <div className="truncate font-bold">{col.name}</div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        {col.city}, {col.state}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-neutral-900 font-semibold">{col.placementOfficerName}</div>
                      <div className="text-[10px] text-amber-800">{col.placementOfficerEmail}</div>
                    </td>
                    <td className="p-3.5 text-neutral-700">
                      {col.city}, {col.state}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-neutral-900">
                      {col.studentCount}
                    </td>
                    <td className="p-3.5 text-neutral-500">
                      {col.createdBy?.fullName || 'BD Team'}
                    </td>
                    <td className="p-3.5 text-neutral-500">{formatDate(col.createdAt)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <NavLink
                          to={`/proposals/new?collegeId=${col.id}`}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Proposal</span>
                        </NavLink>
                        <NavLink
                          to={`/colleges/${col.id}`}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                          title="View College Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </NavLink>
                        {isManagerOrAdmin && (
                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingCollege(col);
                            }}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                            title="Archive College"
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

      {/* Archive / Delete College Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingCollege)}
        onClose={() => setDeletingCollege(null)}
        title="Archive Institutional Partner"
        subtitle="Soft delete removes the college from active directory while preserving history"
        maxWidth="md"
      >
        {deleteError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{deleteError}</span>
          </div>
        )}

        {deletingCollege && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to archive <strong className="text-neutral-900">{deletingCollege.name}</strong> (<span className="font-mono text-amber-800">{deletingCollege.collegeId}</span>)?
            </p>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 space-y-1">
              <div>• Active proposals and future proposal creation will be restricted.</div>
              <div>• Historical proposals, snapshots, and audit trail are safely preserved.</div>
              <div>• Total active college counts on manager dashboards will update immediately.</div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingCollege(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                isLoading={isDeleting}
                onClick={handleDeleteSubmit}
              >
                Archive Institution
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Register College Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register Institutional Partner"
        subtitle="Generates unique GEN-COL-2026-XXXXX identifier automatically"
        maxWidth="2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                College / University Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. National Institute of Engineering & Technology"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Placement Officer Name *
              </label>
              <input
                type="text"
                required
                value={formData.placementOfficerName}
                onChange={(e) => setFormData({ ...formData, placementOfficerName: e.target.value })}
                placeholder="Dr. Rajesh Kumar"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Placement Officer Email *
              </label>
              <input
                type="email"
                required
                value={formData.placementOfficerEmail}
                onChange={(e) => setFormData({ ...formData, placementOfficerEmail: e.target.value })}
                placeholder="placements@niet.edu"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Placement Officer Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.placementOfficerPhone}
                onChange={(e) => setFormData({ ...formData, placementOfficerPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Estimated Batch Size (Students) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.studentCount}
                onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                College Campus Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot 45, Knowledge Park II"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Bengaluru"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Karnataka"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="560001"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Institutional Notes & Requirements (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Specific branch targets, preferred start month, placement history..."
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Create Institution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
