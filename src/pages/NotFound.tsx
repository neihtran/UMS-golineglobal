import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--bg-base))] p-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[rgb(var(--bg-hover))]">
            <Package className="h-12 w-12 text-[rgb(var(--text-muted))]" />
          </div>
        </div>
        <div>
          <p className="text-6xl font-bold text-[rgb(var(--primary))]">404</p>
          <h1 className="mt-2 text-xl font-semibold text-[rgb(var(--text-primary))]">Trang không tìm thấy</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[rgb(var(--primary-light))] transition-colors"
        >
          Quay về Dashboard
        </Link>
      </div>
    </div>
  );
}
