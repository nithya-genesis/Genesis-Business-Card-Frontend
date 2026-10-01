import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Copy, Check, Download, ExternalLink, QrCode, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../api/client';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalCode: string;
  collegeName: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  proposalId,
  proposalCode,
  collegeName,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && proposalId) {
      const fetchQr = async () => {
        setIsLoading(true);
        try {
          const res = await apiClient.get(`/proposals/${proposalId}/qr`);
          if (res.data.success) {
            setQrDataUrl(res.data.data.dataUrl);
            setPublicUrl(res.data.data.url);
          }
        } catch (err) {
          console.error('Failed to load QR code:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchQr();
    }
  }, [isOpen, proposalId]);

  const handleCopy = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPng = async () => {
    if (proposalId) {
      try {
        const response = await apiClient.get(`/proposals/${proposalId}/qr/download`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'image/png' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Genesis-Proposal-QR-${proposalCode}.png`);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proposal Shareable Link & QR Code"
      subtitle={`Secure cryptographic portal for ${collegeName}`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center space-y-5 py-2 text-center">
        {/* QR Code Container */}
        <div className="relative p-4 bg-white rounded-2xl shadow-lg border-2 border-amber-400 flex items-center justify-center">
          {isLoading ? (
            <div className="w-64 h-64 flex flex-col items-center justify-center text-neutral-600 space-y-2">
              <QrCode className="w-10 h-10 animate-pulse text-amber-500" />
              <p className="text-xs">Generating secure vector QR...</p>
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Genesis Proposal QR Code"
              className="w-64 h-64 object-contain rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-neutral-400 text-sm">
              Unable to generate QR code
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Encrypted token access (Proposal #{proposalCode})</span>
        </div>

        {/* Copy Link Input Bar */}
        <div className="w-full space-y-2 text-left">
          <label className="text-xs font-bold text-neutral-700">Direct Shareable Web Link</label>
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-300 rounded-lg p-1.5 pl-3">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="bg-transparent text-xs text-neutral-800 w-full focus:outline-none font-mono"
            />
            <Button
              size="sm"
              variant={copied ? 'success' : 'secondary'}
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={handleDownloadPng}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download PNG
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => window.open(publicUrl, '_blank')}
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            Open Proposal
          </Button>
        </div>
      </div>
    </Modal>
  );
};
