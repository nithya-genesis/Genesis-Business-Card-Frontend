import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { AuditLog } from '../types';
import { Card } from '../components/common/Card';
import { formatDateTime } from '../utils/formatters';
import { ShieldAlert, Search, RefreshCw } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/audit-logs', {
        params: { page, limit: 20 },
      });
      if (res.data.success) {
        setLogs(res.data.data.logs);
        setTotal(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            System Governance & Audit Logs
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Complete cryptographic traceability of all proposals, approvals, revisions, and system modifications
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
          Refresh Registry
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Details / Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500">
                    No system audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-neutral-500">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="p-3.5 font-bold text-neutral-900">
                      {log.user ? log.user.fullName : 'College Viewer / Public Link'}
                      {log.user && (
                        <span className="text-[10px] text-neutral-500 block font-normal">
                          {log.user.role}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-mono font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-neutral-700">
                      {log.entity} #{log.entityId.substring(0, 8)}...
                    </td>
                    <td className="p-3.5 text-neutral-600 text-[11px] max-w-xs truncate font-mono">
                      {log.newValue || log.oldValue || '—'}
                    </td>
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
