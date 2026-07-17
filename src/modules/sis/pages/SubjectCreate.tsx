import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';
import {
  useCreateHqnhatSubject,
  useHqnhatSubjectTypes,
} from '@/hooks/useHqnhat';
import type { HqnhatSubjectCreatePayload } from '@/types/hqnhat.types';

export default function SubjectCreate() {
  const navigate = useNavigate();
  const createMut = useCreateHqnhatSubject();
  const { data: subjectTypesData } = useHqnhatSubjectTypes({ per_page: 100 });
  const subjectTypes = subjectTypesData?.data ?? [];

  const [form, setForm] = useState<HqnhatSubjectCreatePayload>({
    code: '',
    name: '',
    subject_type_id: 0,
    credit: 0,
    theory_hours: 0,
    practice_hours: 0,
    lab_hours: 0,
    description: '',
    status: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã môn học không được để trống';
    if (!form.name.trim()) e.name = 'Tên môn học không được để trống';
    if (!form.subject_type_id) e.subject_type_id = 'Chọn nhóm môn học';
    if (!form.credit || form.credit <= 0) e.credit = 'Số tín chỉ phải > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    try {
      await createMut.mutateAsync(form);
      navigate('/sis/mon-hoc');
    } catch (err: any) {
      setSubmitError(err.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm môn học mới"
        description="Điền thông tin để tạo môn học mới trong hệ thống."
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục', href: '/sis' },
          { label: 'Môn học', href: '/sis/mon-hoc' },
          { label: 'Thêm mới' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/mon-hoc')}>
            Quay lại
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin môn học</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            {submitError && (
              <div className="col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {submitError}
              </div>
            )}
            <FormField label="Mã môn học" error={errors.code} required>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: IT101"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Số tín chỉ" error={errors.credit} required>
              <input
                type="number"
                value={form.credit}
                onChange={(e) => setForm({ ...form, credit: Number(e.target.value) })}
                placeholder="VD: 3"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Tên môn học" error={errors.name} required className="col-span-2">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Lập trình căn bản"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Nhóm môn học" error={errors.subject_type_id} required>
              <select
                value={form.subject_type_id}
                onChange={(e) => setForm({ ...form, subject_type_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>— Chọn nhóm môn —</option>
                {subjectTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 0 | 1 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Ngừng sử dụng</option>
              </select>
            </FormField>
            <div className="col-span-2 grid grid-cols-3 gap-4">
              <FormField label="Giờ lý thuyết">
                <input
                  type="number"
                  value={form.theory_hours}
                  onChange={(e) => setForm({ ...form, theory_hours: Number(e.target.value) })}
                  placeholder="VD: 30"
                  className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
                />
              </FormField>
              <FormField label="Giờ thực hành">
                <input
                  type="number"
                  value={form.practice_hours}
                  onChange={(e) => setForm({ ...form, practice_hours: Number(e.target.value) })}
                  placeholder="VD: 15"
                  className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
                />
              </FormField>
              <FormField label="Giờ lab">
                <input
                  type="number"
                  value={form.lab_hours}
                  onChange={(e) => setForm({ ...form, lab_hours: Number(e.target.value) })}
                  placeholder="VD: 0"
                  className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
                />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Mô tả">
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về nội dung môn học..."
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40 resize-none"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/mon-hoc')}>
            Quay lại
          </Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />} disabled={createMut.isPending}>
            {createMut.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </form>
    </div>
  );
}
