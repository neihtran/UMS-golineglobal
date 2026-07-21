import { DATE_FORMAT, DATETIME_FORMAT, SHORT_DATE_FORMAT, CURRENCY_LOCALE } from '@/constants/modules';

// ─── Date formatters ──────────────────────────────────────────────────────────

export function formatDate(date: string | Date, fmt = DATE_FORMAT): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const pad = (n: number) => String(n).padStart(2, '0');
  const dd = pad(d.getDate());
  const MM = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());

  return fmt
    .replace('dd', dd)
    .replace('MM', MM)
    .replace('yyyy', String(yyyy))
    .replace('HH', HH)
    .replace('mm', mm);
}

export function formatDatetime(date: string | Date): string {
  return formatDate(date, DATETIME_FORMAT);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return formatDate(date, DATETIME_FORMAT);
}

export function formatShortDate(date: string | Date): string {
  return formatDate(date, SHORT_DATE_FORMAT);
}

export function formatRelativeTime(date: string | Date): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return formatShortDate(d);
}

export function getDaysUntil(date: string): number {
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

// ─── Currency formatters ───────────────────────────────────────────────────────

export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)} tỷ`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(0)} triệu`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(0)}K`;
  }
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ─── String formatters ────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function initials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str
    .split(' ')
    .map(capitalize)
    .join(' ');
}

// ─── File size formatter ─────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Phone formatter ─────────────────────────────────────────────────────────

export function formatPhone(phone: string): string {
  if (!phone) return '—';
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
}

// ─── ID formatters ───────────────────────────────────────────────────────────

export function formatStudentId(msv: string): string {
  return msv.toUpperCase();
}

export function formatEmployeeCode(code: string): string {
  return code.toUpperCase();
}
