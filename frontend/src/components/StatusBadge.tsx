import React from 'react';

interface StatusBadgeProps {
  status: 'UP' | 'DOWN' | 'LOADING' | 'ENABLED' | 'DISABLED';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const isUp = status === 'UP' || status === 'ENABLED';
  const isLoading = status === 'LOADING';

  const badgeColor = isLoading
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : isUp
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  const dotColor = isLoading
    ? 'bg-amber-400 animate-pulse'
    : isUp
    ? 'bg-emerald-400'
    : 'bg-rose-400';

  const textSize = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${badgeColor} ${textSize}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label || status}
    </span>
  );
};
