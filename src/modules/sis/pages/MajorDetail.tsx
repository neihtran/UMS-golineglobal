import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  BookOpen,
  GraduationCap,
  Building2,
  FileText,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, Modal, ConfirmModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import {
  useHqnhatMajor,
  useUpdateHqnhatMajor,
  useDeleteHqnhatMajor,
  useHqnhatSpecializations,
} from '@/hooks/useHqnhat';
import type { HqnhatMajor, HqnhatSpecialization } from '@/types/hqnhat.types';
import { FormField } from '@/components/forms';
import { Input } from '@/components/ui';

interface MajorDetailProps {
  id: string;
}

const STATUS_CONFIG: Record<number, { variant: 'success' | 'neutral'; label: string }> = {
  1: { variant: 'success', label: 'Đang hoạt động' },
  0: { variant: 'neutral', label: 'Ngừng hoạt động' },
};

const DEGREE_LEVEL_CONFIG: Record<number, string> = {
  1: 'Đại học',
  2: 'Thạc sĩ',
  3: 'Tiến sĩ',
};

export default function MajorDetail({ id }: MajorDetailProps) {
  const navigate = useNavigate();
  const numId = Number(id);

  const { data: majorData, isLoading, isError, refetch } = useHqnhatMajor(numId);
  const updateMut = useUpdateHqnhatMajor();
  const deleteMut = useDeleteHqnhatMajor();

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    degree_level: 1 as 1 | 2 | 3,
    status: 1 as 0 | 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load specializations for this major
  const { data: specData } = useHqnhatSpecializations({ major_id: numId, per_page: 100 });
  const specializations = specData?.data ?? [];

  const major = majorData?.data;

  const handleEdit = () => {
    if (!major) return;
    setForm({
      code: major.code,
      name: major.name,
      description: major.description,
      degree_level: major.degree_level as 1 | 2 | 3,
      status: major.status as 0 | 1,
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã ngành không được để trống';
    if (!form.name.trim()) e.name = 'Tên ngành không được để trống';
    setErrors(e);
    if (Object.keys(e).length) return;

    await updateMut.mutateAsync({
      id: numId,
      payload: {
        department_id: major!.department_id,
        code: form.code,
        name: form.name,
        description: form.description,
        degree_level: form.degree_level,
        status: form.status,
      },
    });
    setEditing(false);
    refetch();
  };

  const handleDelete = async () => {
    await deleteMut.mutateAsync(numId);
    setDeleting(false);
    navigate('/sis/nganh-hoc');
  };

  if (isLoading) {
    return <LoadingState message="Đang tải thông tin ngành học..." />;
  }

  if (isError || !major) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Không tìm thấy ngành học"
          description="Ngành học này có thể đã bị xóa hoặc bạn không có quyền truy cập."
          icon={<BookOpen className="h-12 w-12" />}
          action={
            <Button variant="outline" onClick={() => navigate('/sis/nganh-hoc')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[major.status] ?? STATUS_CONFIG[0];
  const degreeLabel = DEGREE_LEVEL_CONFIG[major.degree_level] ?? `Bậc ${major.degree_level}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={major.name}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục', href: '/sis/nganh-hoc' },
          { label: major.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/nganh-hoc')}>
              Quay lại
            </Button>
            <Button variant="outline" leftIcon={<Edit2 className="h-4 w-4" />} onClick={handleEdit}>
              Chỉnh sửa
            </Button>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleting(true)}>
              Xóa
            </Button>
          </div>
        }
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10">
              <BookOpen className="h-5 w-5 text-[rgb(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--text-muted))]">Mã ngành</p>
              <p className="font-mono font-semibold">{major.code}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10">
              <GraduationCap className="h-5 w-5 text-[rgb(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--text-muted))]">Bậc đào tạo</p>
              <p className="font-semibold">{degreeLabel}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10">
              <Building2 className="h-5 w-5 text-[rgb(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--text-muted))]">Khoa/Viện (ID)</p>
              <p className="font-mono font-semibold">{major.department_id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10">
              <FileText className="h-5 w-5 text-[rgb(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--text-muted))]">Trạng thái</p>
              <Badge variant={statusCfg.variant} dot>
                {statusCfg.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Description */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Thông tin ngành học</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Mã ngành</dt>
                  <dd className="font-mono text-lg">{major.code}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Tên ngành</dt>
                  <dd className="text-lg font-medium">{major.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Bậc đào tạo</dt>
                  <dd>{degreeLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Mô tả</dt>
                  <dd className="text-[rgb(var(--text-secondary))]">
                    {major.description || 'Chưa có mô tả'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Thông tin hệ thống</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[rgb(var(--text-muted))]">ID</dt>
                  <dd className="font-mono">{major.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[rgb(var(--text-muted))]">Khoa/Viện</dt>
                  <dd className="font-mono">{major.department_id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[rgb(var(--text-muted))]">Trạng thái</dt>
                  <dd>
                    <Badge variant={statusCfg.variant} dot>
                      {statusCfg.label}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Specializations quick view */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Chuyên ngành</h3>
                <span className="text-sm text-[rgb(var(--text-muted))]">
                  {specializations.length} chuyên ngành
                </span>
              </div>
              {specializations.length === 0 ? (
                <p className="text-sm text-[rgb(var(--text-muted))]">Chưa có chuyên ngành nào</p>
              ) : (
                <ul className="space-y-2">
                  {specializations.slice(0, 5).map((spec: HqnhatSpecialization) => (
                    <li key={spec.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-2">
                      <div>
                        <p className="font-medium">{spec.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{spec.code}</p>
                      </div>
                      <Badge variant={spec.status === 1 ? 'success' : 'neutral'} dot className="shrink-0">
                        {spec.status === 1 ? 'Hoạt động' : 'Ngừng'}
                      </Badge>
                    </li>
                  ))}
                  {specializations.length > 5 && (
                    <li className="text-center">
                      <Link
                        to={`/sis/chuyen-nganh?major=${major.id}`}
                        className="text-sm text-[rgb(var(--primary))] hover:underline"
                      >
                        Xem tất cả {specializations.length} chuyên ngành
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Chỉnh sửa ngành học"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} loading={updateMut.isPending}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Mã ngành" error={errors.code} required>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="VD: SE, IS, AI"
            />
          </FormField>
          <FormField label="Tên ngành" error={errors.name} required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Software Engineering"
            />
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40 resize-none"
              placeholder="Mô tả về ngành học..."
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Bậc đào tạo">
              <select
                value={form.degree_level}
                onChange={(e) => setForm({ ...form, degree_level: Number(e.target.value) as 1 | 2 | 3 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Đại học</option>
                <option value={2}>Thạc sĩ</option>
                <option value={3}>Tiến sĩ</option>
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 0 | 1 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Đang hoạt động</option>
                <option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa ngành học"
        description={`Bạn có chắc chắn muốn xóa ngành "${major.name}" (mã ${major.code})? Hành động này không thể hoàn tác.`}
        confirmText="Xóa ngành học"
        loading={deleteMut.isPending}
        variant="danger"
      />
    </div>
  );
}
