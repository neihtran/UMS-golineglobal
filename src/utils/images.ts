const CDN_DOMAIN = import.meta.env.VITE_CDN_DOMAIN || 'https://storage.hqnhat.id.vn';

export function getImageUrl(path?: string | null): string {
  if (!path) return '/images/default-placeholder.png';

  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CDN_DOMAIN}/${cleanPath}`;
}
