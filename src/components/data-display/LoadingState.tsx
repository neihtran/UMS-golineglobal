import { useTranslation } from 'react-i18next';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

export function LoadingState({ message, size = 'md', className = '' }: LoadingStateProps) {
  const { t } = useTranslation('common');
  const loadingMessage = message ?? t('common.loading');
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 ${className}`}>
      <div
        className={`animate-spin rounded-full border-[rgb(var(--border))] border-t-[rgb(var(--primary))] ${SIZE_CLASSES[size]}`}
      />
      {loadingMessage && (
        <p className="text-sm text-[rgb(var(--text-muted))]">{loadingMessage}</p>
      )}
    </div>
  );
}
