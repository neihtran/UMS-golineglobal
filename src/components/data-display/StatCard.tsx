import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeValue?: number;
  trend?: 'up' | 'down' | 'flat';
  icon?: React.ReactNode;
  iconColor?: string;
  sublabel?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  change,
  changeValue,
  trend,
  icon,
  iconColor,
  sublabel,
  className = '',
  onClick,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-[rgb(var(--success))]' : trend === 'down' ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-muted))]';

  return (
    <div
      className={`rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 transition-all hover:border-[rgb(var(--primary-light))] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${iconColor ?? 'rgb(var(--primary))'} 10%, transparent)`, color: iconColor ?? 'rgb(var(--primary))' }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide leading-tight">{label}</p>
          <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5 leading-tight">{value}</p>
          {(change || changeValue !== undefined) && (
            <div className="flex items-center gap-1 mt-0.5">
              {trend && <TrendIcon className={`h-3 w-3 shrink-0 ${trendColor}`} />}
              {changeValue !== undefined && (
                <span className={`text-xs font-semibold ${trendColor}`}>
                  {trend === 'up' ? '+' : trend === 'down' ? '' : ''}{changeValue}%
                </span>
              )}
              {change && <span className="text-xs text-[rgb(var(--text-muted))]">{change}</span>}
            </div>
          )}
          {sublabel && <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}
