import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { apiClient } from '../api/client';
import { College, Proposal } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { QRModal } from '../components/common/QRModal';
import { formatINR, formatDate } from '../utils/formatters';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Users,
  PlusCircle,
  FileSpreadsheet,
  QrCode,
  FileDown,
} from 'lucide-react';

export const CollegeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [college, setCollege] = useState<College | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedQrProposal, setSelectedQrProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const [collegeRes, propRes] = await Promise.all([
          apiClient.get(`/colleges/${id}`),
          apiClient.get(`/proposals?collegeId=${id}`),
        ]);
        if (collegeRes.data.success) {
          setCollege(collegeRes.data.data);
        }
        if (propRes.data.success) {
          setProposals(propRes.data.data.proposals);
        }
      } catch (err) {
        console.error('Failed to load college detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchCollege();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center text-neutral-500 text-xs font-semibold">
        Loading college profile...
      </div>
    );
  }

  if (!college) {
    return (
      <div className="py-20 text-center text-neutral-500">
        <p>College record not found</p>
        <NavLink to="/colleges" className="text-amber-700 underline mt-2 block text-xs font-bold">
          Back to Colleges
        </NavLink>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <NavLink
        to="/colleges"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Colleges
      </NavLink>

      {/* Profile Card */}
      <Card className="p-6 relative overflow-hidden bg-white border-neutral-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
              {college.collegeId}
            </span>
            <h1 className="text-2xl font-black text-neutral-900">{college.name}</h1>
            <p className="text-xs text-neutral-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              {college.address}, {college.city}, {college.state} - {college.pincode}
            </p>
          </div>

          <NavLink to={`/proposals/new?collegeId=${college.id}`}>
            <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create New Proposal
            </Button>
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-100 text-xs">
          <div className="space-y-1">
            <span className="text-neutral-500 font-medium block">Placement Lead</span>
            <span className="font-bold text-neutral-900">{college.placementOfficerName}</span>
            <div className="text-neutral-500 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-neutral-400" /> {college.placementOfficerEmail}
            </div>
            <div className="text-neutral-500 flex items-center gap-1">
              <Phone className="w-3 h-3 text-neutral-400" /> {college.placementOfficerPhone}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-neutral-500 font-medium block">Student Capacity</span>
            <span className="text-xl font-black text-neutral-900 font-mono">
              {college.studentCount} Students
            </span>
            <span className="text-[10px] text-neutral-400 block">Registered batch size</span>
          </div>

          <div className="space-y-1">
            <span className="text-neutral-500 font-medium block">Account Management</span>
            <span className="font-bold text-neutral-900">{college.createdBy?.fullName || 'BD Team'}</span>
            <span className="text-[10px] text-neutral-400 block">Registered on {formatDate(college.createdAt)}</span>
          </div>
        </div>
      </Card>

      {/* Proposals History */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-neutral-900">Proposals Generated for this Institution</h3>
          </div>
          <span className="text-xs text-neutral-500 font-semibold">{proposals.length} Proposals</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3">Proposal ID</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Students</th>
                <th className="p-3">Valuation</th>
                <th className="p-3">Version</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-neutral-500">
                    No proposals generated yet for this college.
                  </td>
                </tr>
              ) : (
                proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-800">
                      <NavLink to={`/proposals/${p.id}`} className="hover:underline">
                        {p.proposalId}
                      </NavLink>
                    </td>
                    <td className="p-3 font-bold text-neutral-800">{p.plan?.name}</td>
                    <td className="p-3 font-mono">{p.studentCount}</td>
                    <td className="p-3 font-mono font-bold text-neutral-900">{formatINR(p.finalTotal)}</td>
                    <td className="p-3 font-mono text-[10px]">v{p.currentVersion}</td>
                    <td className="p-3"><Badge variant="status" status={p.status} size="sm" /></td>
                    <td className="p-3 text-neutral-500">{formatDate(p.createdAt)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedQrProposal(p)}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-amber-100 text-neutral-800 transition-colors"
                          title="View QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <NavLink
                          to={`/proposals/${p.id}`}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                        >
                          Details
                        </NavLink>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedQrProposal && (
        <QRModal
          isOpen={!!selectedQrProposal}
          onClose={() => setSelectedQrProposal(null)}
          proposalId={selectedQrProposal.id}
          proposalCode={selectedQrProposal.proposalId}
          collegeName={college.name}
        />
      )}
    </div>
  );
};
