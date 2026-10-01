import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { User, Role } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/formatters';
import { Users, Plus, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'BD_EXECUTIVE' as Role,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/users', formData);
      if (res.data.success) {
        setIsCreateOpen(false);
        setFormData({
          fullName: '',
          email: '',
          password: '',
          phone: '',
          role: 'BD_EXECUTIVE',
        });
        fetchUsers();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
      case 'ADMIN':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'BD_MANAGER':
        return 'border-amber-200 bg-amber-50 text-amber-900';
      case 'BD_EXECUTIVE':
      case 'BD':
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            User Management & Authorization
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage BD Executives, BD Managers, and Platform Administrators
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Team Member
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-neutral-900">{u.fullName}</td>
                    <td className="p-3.5 text-neutral-700 font-medium">{u.email}</td>
                    <td className="p-3.5 text-neutral-500">{u.phone || '—'}</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getRoleBadge(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Team Member"
        subtitle="Provision access for BD Executive, BD Manager, or System Admin"
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Suresh Menon"
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Corporate Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="suresh@genesistraining.in"
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 00000"
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">System Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="BD_EXECUTIVE">BD Executive (Proposal Builder & Sharing)</option>
              <option value="BD_MANAGER">BD Manager (Approvals & PDF Generation)</option>
              <option value="SYSTEM_ADMIN">System Administrator (Full Control)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
