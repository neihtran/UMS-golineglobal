import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';
import {
  useHqnhatCurriculum,
  useUpdateHqnhatCurriculum,
  useHqnhatMajors,
  useHqnhatTrainingSystems,
} from '@/hooks/useHqnhat';
import { Input } from '@/components/ui';
import type { HqnhatCurriculumCreatePayload } from '@/types/hqnhat.types';

const emptyForm = (): HqnhatCurriculumCreatePayload => ({
  code: '',
  name: '',
  major_id: 0,
  training_system_id: 0,
  course_id: 0,
  total_credit: 0,
  elective_credit: 0,
  description: '',
  status: 1,
});

export default function CurriculumEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<HqnhatCurriculumCreatePayload>(emptyForm());

  const { data, isLoading } = useHqnhatCurriculum(id);
  const { data: majorsData } = useHqnhatMajors({ per_page: 100 });
  const { data: trainingSystemsData } = useHqnhatTrainingSystems({ per_page: 100 });
  const updateMut = useUpdateHqnhatCurriculum();

  const item = data?.data;
  const majors = majorsData?.data ?? [];
  const trainingSystems = trainingSystemsData?.data ?? [];

  useEffect(() => {
    if (item && form.code === '') {
      setForm({
        code: item.code,
        name: item.name,
        major_id: item.major_id,
        specialization_id: item.specialization_id,
        training_system_id: item.training_system_id,
        course_id: item.course_id,
        total_credit: item.total_credit,
        elective_credit: item.elective_credit,
        description: item.description ?? '',
        status: item.status as 0 | 1,
      });
    }
  }, [item]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = 'Mã CTĐT không được để trống';
    if (!form.name.trim()) newErrors.name = 'Tên không được để trống';
    if (!form.major_id) newErrors.major_id = 'Chọn ngành';
    if (!form.training_system_id) newErrors.training_system_id = 'Chọn hệ đào tạo';
    if (!form.course_id) newErrors.course_id = 'Chọn khóa sinh viên';
    if (!form.total_credit || form.total_credit <= 0) newErrors.total_credit = 'Tổng tín chỉ phải > 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;
    setSubmitError(null);
    try {
      await updateMut.mutateAsync({ id: Number(id), payload: form });
      navigate(`/sis/ctdt/${id}`);
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
        title="Sửa CTĐT"
        description={item ? `Chỉnh sửa: ${item.name}` : ''}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục', href: '/sis' },
          { label: 'CTĐT', href: '/sis/ctdt' },
          { label: item?.name ?? '—', href: item ? `/sis/ctdt/${id}` : undefined },
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
            <FormField label="Mã CTĐT" error={errors.code} required>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: SE2026"
              />
            </FormField>
            <FormField label="Tổng tín chỉ" error={errors.total_credit} required>
              <Input
                type="number"
                value={form.total_credit}
                onChange={(e) => setForm({ ...form, total_credit: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <FormField label="Tên chương trình" error={errors.name} required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Chương trình đào tạo Kỹ thuật phần mềm 2026"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ngành" error={errors.major_id} required>
              <select
                value={form.major_id}
                onChange={(e) => setForm({ ...form, major_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn ngành --</option>
                {majors.map(m => (
                  <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Hệ đào tạo" error={errors.training_system_id} required>
              <select
                value={form.training_system_id}
                onChange={(e) => setForm({ ...form, training_system_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn hệ --</option>
                {trainingSystems.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Khóa sinh viên" error={errors.course_id} required>
              <Input
                type="number"
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Tín chỉ tự chọn">
              <Input
                type="number"
                value={form.elective_credit}
                onChange={(e) => setForm({ ...form, elective_credit: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Chuyên ngành (tùy chọn)">
              <Input
                type="number"
                value={form.specialization_id ?? ''}
                onChange={(e) => setForm({ ...form, specialization_id: e.target.value ? Number(e.target.value) : null })}
              />
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

          <FormField label="Mô tả">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </FormField>

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
