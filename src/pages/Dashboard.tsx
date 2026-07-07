import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { ROLES } from '@/constants/modules';

/**
 * Dashboard chuyển hướng — mỗi role sẽ được điều hướng đến trang dashboard riêng.
 * SUPER_ADMIN               → /dashboard/admin
 * HIEU_TRUONG / PHO_HIEU_TRUONG → /dashboard/bgh
 * TRUONG_KHOA             → /dashboard/truong-khoa
 * Các role còn lại (GIAO_VIEN, NHAN_VIEN, SINH_VIEN, …) → /dashboard/gv
 */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.role === ROLES.SUPER_ADMIN) {
      navigate('/dashboard/admin', { replace: true });
    } else if (user.role === ROLES.HIEU_TRUONG || user.role === ROLES.PHO_HIEU_TRUONG) {
      navigate('/dashboard/bgh', { replace: true });
    } else if (user.role === ROLES.TRUONG_KHOA) {
      navigate('/dashboard/truong-khoa', { replace: true });
    } else {
      // Giảng viên, nhân viên, sinh viên → dùng dashboard giảng viên
      navigate('/dashboard/gv', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--border))] border-t-[rgb(var(--primary))]" />
    </div>
  );
}
