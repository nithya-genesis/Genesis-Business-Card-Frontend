import React from 'react';
import { PricingCalculationResult } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Calculator, CheckCircle2 } from 'lucide-react';

interface LivePriceSummaryProps {
  collegeName?: string;
  calculation: PricingCalculationResult | null;
  isLoading?: boolean;
}

export const LivePriceSummary: React.FC<LivePriceSummaryProps> = ({
  collegeName,
  calculation,
  isLoading = false,
}) => {
  if (!calculation) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-neutral-500 shadow-sm">
        <Calculator className="w-8 h-8 mx-auto mb-2 text-neutral-400 animate-pulse" />
        <p className="text-sm font-medium">Configure curriculum plan and student count to calculate proposal pricing</p>
      </div>
    );
  }

  const studentCount = calculation.studentCount || 1;
  const customItemsCost = calculation.customItemsTotalCost || 0;
  const subtotal = calculation.subtotal || (calculation.baseTrainingCost + calculation.addonsTotalCost + customItemsCost);
  const discountAmount = calculation.discountAmount || 0;
  const taxableAmount = calculation.taxableAmount || Math.max(0, subtotal - discountAmount);
  const gstRate = calculation.gstRate || 18.0;
  const gstAmount = calculation.gstAmount || Math.round(((taxableAmount * gstRate) / 100) * 100) / 100;
  const grandTotal = calculation.grandTotal || (taxableAmount + gstAmount);

  const costPerStudentBeforeGst = calculation.costPerStudentBeforeGst || Math.round((taxableAmount / studentCount) * 100) / 100;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-md overflow-hidden text-neutral-900 relative">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Live Pricing Engine
          </span>
        </div>
        {isLoading ? (
          <span className="text-xs text-amber-300 animate-pulse flex items-center gap-1 font-semibold">
            Recalculating...
          </span>
        ) : (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Server Validated
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {collegeName && (
          <div className="pb-3 border-b border-neutral-100">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Target Institution</span>
            <p className="text-sm font-bold text-neutral-900 truncate mt-0.5">{collegeName}</p>
          </div>
        )}

        {/* Breakdown Grid */}
        <div className="space-y-2 text-xs text-neutral-700">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500 font-medium">Curriculum Plan:</span>
            <span className="font-bold text-neutral-900">
              {(calculation.planName || 'Custom Plan').toLowerCase().includes('plan')
                ? calculation.planName
                : `${calculation.planName} Plan`} ({calculation.totalHours || 0} hrs)
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-500 font-medium">Cohort Batch Size:</span>
            <span className="font-bold text-amber-800">{calculation.studentCount} Students</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
            <span className="text-neutral-700 font-medium">Base Training:</span>
            <span className="font-bold text-neutral-900 font-mono">
              {formatCurrency(calculation.baseTrainingCost)}
            </span>
          </div>

          {calculation.addonsTotalCost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-neutral-700 font-medium">Add-ons ({calculation.addons?.length || 0}):</span>
              <span className="font-bold text-neutral-900 font-mono">
                {formatCurrency(calculation.addonsTotalCost)}
              </span>
            </div>
          )}

          {customItemsCost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-neutral-700 font-medium">Custom Items ({calculation.customItems?.length || 0}):</span>
              <span className="font-bold text-purple-900 font-mono">
                {formatCurrency(customItemsCost)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1.5 border-t border-neutral-100 font-semibold text-neutral-800">
            <span>Subtotal:</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
              <span>Discount ({calculation.discountType === 'PERCENTAGE' ? `${calculation.discountValue}%` : 'Special'}):</span>
              <span className="font-mono">- {formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-neutral-900 font-bold pt-1 border-t border-neutral-100">
            <span>Taxable Amount (Pre-GST):</span>
            <span className="font-mono">{formatCurrency(taxableAmount)}</span>
          </div>

          <div className="flex justify-between items-center text-amber-900 bg-amber-50/80 px-2 py-1.5 rounded-lg font-semibold border border-amber-200/60">
            <span>Cost Per Student — Before GST:</span>
            <span className="font-mono font-bold text-sm">{formatCurrency(costPerStudentBeforeGst)}</span>
          </div>

          <div className="flex justify-between items-center text-neutral-600">
            <span>GST @ {gstRate}%:</span>
            <span className="font-mono font-semibold">{formatCurrency(gstAmount)}</span>
          </div>
        </div>

        {/* Grand Total Box */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-950/80">
                Grand Total
              </span>
              <p className="text-[10px] text-neutral-900/90 font-medium">Inclusive of 18% GST</p>
            </div>
            <span className="text-2xl font-black text-neutral-950 font-mono tracking-tight">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
