import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { ROLES } from '@/constants/modules';

/**
 * Dashboard chuyển hướng — mỗi role sẽ được điều hướng đến trang dashboard riêng.
 * ADMIN              → /dashboard/admin
 * HIEU_TRUONG / PHO_HIEU_TRUONG → /dashboard/bgh
 * TRUONG_KHOA        → /dashboard/truong-khoa
 * GIAO_VIEN          → /dashboard/giao-vien
 * NHAN_VIEN          → /dashboard/nhan-vien
 * SINH_VIEN          → /dashboard/sinh-vien
 */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.role === ROLES.ADMIN) {
      navigate('/dashboard/admin', { replace: true });
    } else if (user.role === ROLES.HIEU_TRUONG || user.role === ROLES.PHO_HIEU_TRUONG) {
      navigate('/dashboard/bgh', { replace: true });
    } else if (user.role === ROLES.TRUONG_KHOA) {
      navigate('/dashboard/truong-khoa', { replace: true });
    } else if (user.role === ROLES.GIAO_VIEN) {
      navigate('/dashboard/giao-vien', { replace: true });
    } else if (user.role === ROLES.NHAN_VIEN) {
      navigate('/dashboard/nhan-vien', { replace: true });
    } else if (user.role === ROLES.SINH_VIEN) {
      navigate('/dashboard/sinh-vien', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--border))] border-t-[rgb(var(--primary))]" />
    </div>
  );
}
