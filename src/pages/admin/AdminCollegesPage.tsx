import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { College } from '../../types';
import { Card } from '../../components/common/Card';
import { formatDate } from '../../utils/formatters';
import {
  Building2,
  Search,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminCollegesPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-600" />
            Institutional Partners (Read-Only Governance)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            System Admin view of registered institutions, associated proposals, and placement coordinators.
          </p>
        </div>
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
            className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-500 font-medium"
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
                <th className="p-3.5">Proposals</th>
                <th className="p-3.5">Registered By</th>
                <th className="p-3.5">Created Date</th>
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
                    <td className="p-3.5 font-mono font-bold text-red-900">
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
                      <div className="text-[10px] text-red-800">{col.placementOfficerEmail}</div>
                      <div className="text-[10px] text-neutral-500">{col.placementOfficerPhone}</div>
                    </td>
                    <td className="p-3.5 text-neutral-700">
                      {col.city}, {col.state}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-neutral-900">
                      {col.studentCount}
                    </td>
                    <td className="p-3.5 font-semibold text-neutral-800">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 rounded-md text-xs font-mono">
                        <FileSpreadsheet className="w-3 h-3 text-neutral-500" />
                        {col._count?.proposals || 0}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-500">
                      {col.createdBy?.fullName || 'BD Team'}
                    </td>
                    <td className="p-3.5 text-neutral-500">{formatDate(col.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
