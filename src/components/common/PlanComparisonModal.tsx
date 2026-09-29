import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { apiClient } from '../../api/client';
import { Plan } from '../../types';
import { formatINR } from '../../utils/formatters';
import { Check, Layers } from 'lucide-react';

interface PlanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planId: string) => void;
}

export const PlanComparisonModal: React.FC<PlanComparisonModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      const fetchPlans = async () => {
        setIsLoading(true);
        try {
          const res = await apiClient.get('/plans');
          if (res.data.success) {
            setPlans(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load plans:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPlans();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Curriculum Training Plan Comparison Matrix"
      subtitle="Standardized Genesis curriculum packages and hour distributions"
      maxWidth="3xl"
    >
      {isLoading ? (
        <div className="py-12 text-center text-neutral-500 text-xs font-semibold">
          Loading comparison data...
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isPremium = plan.code === 'PREMIUM';

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                    isPremium
                      ? 'border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-400/20'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <h4 className="text-base font-bold text-neutral-900">{plan.name} Plan</h4>
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                        {plan.totalHours}h
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2">
                      {plan.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-700">
                      {plan.modules.map((m) => (
                        <div key={m.id} className="flex justify-between text-[11px]">
                          <span className="text-neutral-600 truncate max-w-[130px]">{m.name}</span>
                          <span className="font-mono font-bold text-neutral-900">{m.hours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-neutral-100 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Rate / Student (100 studs):</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {formatINR(plan.totalHours * 40 * 100)}
                      </span>
                    </div>

                    {onSelectPlan && (
                      <Button
                        size="sm"
                        variant={isPremium ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => {
                          onSelectPlan(plan.id);
                          onClose();
                        }}
                      >
                        Select {plan.name} Plan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};
