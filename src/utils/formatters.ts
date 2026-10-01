/**
 * Formats a number to Indian currency format (e.g. ₹6,40,000)
 */
export function formatINR(amount?: number | null, includeSymbol: boolean = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? '₹0' : '0';
  }
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded);

  return includeSymbol ? `₹${formatted}` : formatted;
}

export const formatCurrency = formatINR;

export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): { bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'APPROVED':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'PENDING_MANAGER_APPROVAL':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        border: 'border-amber-300',
        dot: 'bg-amber-500',
      };
    case 'SUBMITTED':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'MODIFIED_BY_COLLEGE':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        border: 'border-amber-300',
        dot: 'bg-amber-500',
      };
    case 'VIEWED':
      return {
        bg: 'bg-cyan-50',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        dot: 'bg-cyan-500',
      };
    case 'SHARED':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'REJECTED':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'ARCHIVED':
      return {
        bg: 'bg-zinc-100',
        text: 'text-zinc-600',
        border: 'border-zinc-300',
        dot: 'bg-zinc-400',
      };
    case 'EXPIRED':
      return {
        bg: 'bg-neutral-100',
        text: 'text-neutral-600',
        border: 'border-neutral-200',
        dot: 'bg-neutral-400',
      };
    case 'DRAFT':
    default:
      return {
        bg: 'bg-neutral-100',
        text: 'text-neutral-700',
        border: 'border-neutral-200',
        dot: 'bg-neutral-400',
      };
  }
}
