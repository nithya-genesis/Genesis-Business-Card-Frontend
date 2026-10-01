import React from 'react';
import { clsx } from 'clsx';
import { getStatusColor } from '../../utils/formatters';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'default' | 'primary' | 'outline';
  status?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  className,
  size = 'md',
}) => {
  if (variant === 'status' && status) {
    const styling = getStatusColor(status);
    const readableStatus = status.replace(/_/g, ' ');

    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full border',
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
          styling.bg,
          styling.text,
          styling.border,
          className
        )}
      >
        <span className={clsx('w-1.5 h-1.5 rounded-full', styling.dot)} />
        {children || readableStatus}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border border-slate-700 bg-slate-800/70 text-slate-300',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className
      )}
    >
      {children}
    </span>
  );
};
