import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';
import { useHqnhatAcademicTerm, useUpdateHqnhatAcademicTerm } from '@/hooks/useHqnhat';
import type { HqnhatAcademicTermCreatePayload } from '@/types/hqnhat.types';

const emptyForm = (): HqnhatAcademicTermCreatePayload => ({
  code: '',
  academic_year: '',
  semester: 1,
  start_date: '',
  end_date: '',
  registration_start: '',
  registration_end: '',
  status: 0,
});

export default function AcademicTermEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<HqnhatAcademicTermCreatePayload>(emptyForm());

  const { data, isLoading } = useHqnhatAcademicTerm(id);
  const updateMut = useUpdateHqnhatAcademicTerm();

  const term = data?.data;

  // Sync form when data loads
  useEffect(() => {
    if (term && form.code === '') {
      setForm({
        code: term.code,
        academic_year: term.academic_year,
        semester: term.semester,
        start_date: term.start_date ?? '',
        end_date: term.end_date ?? '',
        registration_start: term.registration_start ?? '',
        registration_end: term.registration_end ?? '',
        status: term.status as 0 | 1 | 2 | 3,
      });
    }
  }, [term]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = 'Mã học kỳ không được để trống';
    if (!form.academic_year.trim()) newErrors.academic_year = 'Năm học không được để trống (VD: 2023-2024)';
    if (!form.semester || form.semester < 1 || form.semester > 3) newErrors.semester = 'Học kỳ phải từ 1 đến 3';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;
    setSubmitError(null);
    try {
      await updateMut.mutateAsync({ id: Number(id), payload: form });
      navigate(`/sis/hoc-ky/${id}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Có lỗi xảy ra');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sửa học kỳ"
        description={term ? `Chỉnh sửa: ${term.code}` : ''}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục', href: '/sis' },
          { label: 'Học kỳ', href: '/sis/hoc-ky' },
          { label: term?.code ?? '—', href: term ? `/sis/hoc-ky/${id}` : undefined },
          { label: 'Sửa' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        }
      />

      <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã học kỳ" error={errors.code} required>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: HK1_2024_2025"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
              />
            </FormField>
            <FormField label="Năm học" error={errors.academic_year} required>
              <input
                type="text"
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                placeholder="VD: 2024-2025"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Học kỳ" error={errors.semester} required>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) as 1 | 2 | 3 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Học kỳ 1</option>
                <option value={2}>Học kỳ 2</option>
                <option value={3}>Học kỳ hè</option>
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 0 | 1 | 2 | 3 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>Lập kế hoạch</option>
                <option value={1}>Mở đăng ký</option>
                <option value={2}>Đang học</option>
                <option value={3}>Đã kết thúc</option>
              </select>
            </FormField>
          </div>

          <div className="border-t border-[rgb(var(--border))] pt-4">
            <p className="text-sm font-medium mb-3 text-[rgb(var(--text-muted))]">Ngày tháng</p>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ngày bắt đầu HK">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
                />
              </FormField>
              <FormField label="Ngày kết thúc HK">
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
                />
              </FormField>
              <FormField label="Ngày bắt đầu đăng ký">
                <input
                  type="date"
                  value={form.registration_start}
                  onChange={(e) => setForm({ ...form, registration_start: e.target.value })}
                  className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
                />
              </FormField>
              <FormField label="Ngày kết thúc đăng ký">
                <input
                  type="date"
                  value={form.registration_end}
                  onChange={(e) => setForm({ ...form, registration_end: e.target.value })}
                  className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Hủy
            </Button>
            <Button type="submit" loading={updateMut.isPending} leftIcon={<Save className="h-4 w-4" />}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
