import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { ProposalVersion } from '../../types';
import { formatINR, formatDateTime } from '../../utils/formatters';
import { X, History } from 'lucide-react';

interface ProposalVersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId?: string;
  versions?: ProposalVersion[];
  currentVersion?: number;
}

export const ProposalVersionDrawer: React.FC<ProposalVersionDrawerProps> = ({
  isOpen,
  onClose,
  proposalId,
  versions: propVersions,
}) => {
  const [fetchedVersions, setFetchedVersions] = useState<ProposalVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && proposalId && !propVersions) {
      const fetchVersions = async () => {
        setIsLoading(true);
        try {
          const res = await apiClient.get(`/proposals/${proposalId}/versions`);
          if (res.data.success) {
            setFetchedVersions(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load versions:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVersions();
    }
  }, [isOpen, proposalId, propVersions]);

  if (!isOpen) return null;

  const versions = propVersions || fetchedVersions;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border-l border-neutral-200 h-full p-6 text-neutral-900 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-neutral-900">Proposal Version History</h3>
                <p className="text-[11px] text-neutral-500">Cryptographic audit log of all changes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-neutral-500 text-xs font-semibold">
              Loading immutable version logs...
            </div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs font-semibold">
              No version history available for this proposal.
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md text-[11px]">
                      Version v{ver.versionNumber}
                    </span>
                    <span className="font-mono text-neutral-500 text-[10px]">
                      {formatDateTime(ver.createdAt)}
                    </span>
                  </div>

                  <p className="text-neutral-700 font-semibold">{ver.changeSummary}</p>

                  <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-[11px]">
                    <span className="text-neutral-500">Author Role: <strong className="text-neutral-800">{ver.changedByRole}</strong></span>
                    <span className="font-mono font-black text-neutral-900">
                      {formatINR(ver.calculatedTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-neutral-100 text-center">
          <p className="text-[10px] text-neutral-400">Genesis Business Card Version Ledger</p>
        </div>
      </div>
    </div>
  );
};
