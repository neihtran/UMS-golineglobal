import React from 'react';
import { clsx } from 'clsx';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarShape = 'circle' | 'rounded';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  color?: string;
}

const sizeMap: Record<AvatarSize, { outer: string; text: string }> = {
  xs:  { outer: 'h-5 w-5', text: 'text-[9px]' },
  sm:  { outer: 'h-7 w-7', text: 'text-[11px]' },
  md:  { outer: 'h-9 w-9', text: 'text-sm' },
  lg:  { outer: 'h-12 w-12', text: 'text-lg' },
  xl:  { outer: 'h-16 w-16', text: 'text-xl' },
};

const shapeMap: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-lg',
};

const AVATAR_COLORS = [
  'bg-[rgb(var(--primary))]',
  'bg-[rgb(var(--accent))]',
  'bg-[rgb(var(--info))]',
  'bg-[rgb(var(--success))]',
  'bg-[rgb(var(--warning))]',
];

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(-2).map((n) => n[0]?.toUpperCase() ?? '').join('');
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, name = '', size = 'md', shape = 'circle', color, className, ...props }, ref) => {
    const initials = getInitials(name);
    const bgColor = color ?? getColor(name);
    const { outer, text } = sizeMap[size];

    return (
      <div
        ref={ref}
        className={clsx(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold text-white',
          outer,
          shapeMap[shape],
          bgColor,
          className,
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span className={clsx('select-none', text)}>{initials}</span>
        )}
      </div>
    );
  },
);
Avatar.displayName = 'Avatar';

// ─── AvatarGroup ─────────────────────────────────────────────────────────────

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ children, max = 4, size = 'sm' }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visible = childArray.slice(0, max);
  const overflow = childArray.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible}
      {overflow > 0 && (
        <div
          className={clsx(
            'relative inline-flex shrink-0 items-center justify-center rounded-full',
            'bg-[rgb(var(--bg-base))] border-2 border-[rgb(var(--bg-card))]',
            'font-semibold text-[rgb(var(--text-muted))]',
            sizeMap[size].outer,
            sizeMap[size].text,
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
