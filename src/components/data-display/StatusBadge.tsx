import { Badge } from '@/components/ui';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  dot?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

export function StatusBadge({ status, label, dot, size = 'default', className = '' }: StatusBadgeProps) {
  return (
    <Badge variant={status} dot={dot} size={size} className={className}>
      {label}
    </Badge>
  );
}
