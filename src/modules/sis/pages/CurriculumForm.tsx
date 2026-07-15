import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import {
  useCreateCurriculum,
  useUpdateCurriculum,
  useSubjectList,
  type Curriculum,
  type CreateCurriculumInput,
  type SubjectCategory,
} from '@/hooks/useSis';
import { useDepartmentList } from '@/hooks/useHrm';
import type { Department } from '@/types/api.types';

const DEGREE_TYPES: Array<Curriculum['degreeType']> = ['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ'];

const CATEGORY_OPTIONS: Array<{ value: SubjectCategory; label: string }> = [
  { value: 'required', label: 'Bắt buộc' },
  { value: 'elective', label: 'Lựa chọn' },
  { value: 'optional', label: 'Tự chọn' },
];

interface SubjectLine {
  uid: string;
  subject: string;
  semester: number;
  category: SubjectCategory;
  groupCode: string;
}

interface CurriculumFormProps {
  mode: 'create' | 'edit';
  initial?: Curriculum | null;
}

function genUid() {
  return `s_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
        {label}
        {required && <span className="text-[rgb(var(--error))] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[rgb(var(--error))]">{error}</p>}
    </div>
  );
}

export default function CurriculumForm({ mode, initial }: CurriculumFormProps) {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();

  const createMutation = useCreateCurriculum();
  const updateMutation = useUpdateCurriculum();

  const { data: deptResp } = useDepartmentList({ isActive: true });
  const { data: subjectResp } = useSubjectList({ pageSize: 200 });

  const departments: Department[] = useMemo(
    () => ((deptResp as any)?.data ?? []) as Department[],
    [deptResp]
  );
  const subjects = useMemo(
    () => ((subjectResp as any)?.data ?? []) as Array<any>,
    [subjectResp]
  );

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [degreeType, setDegreeType] = useState<Curriculum['degreeType']>('Cử nhân');
  const [durationYears, setDurationYears] = useState<number>(4);
  const [totalCredits, setTotalCredits] = useState<number>(120);
  const [requiredCredits, setRequiredCredits] = useState<number>(0);
  const [electiveCredits, setElectiveCredits] = useState<number>(0);
  const [optionalCredits, setOptionalCredits] = useState<number>(0);
  const [effectiveYear, setEffectiveYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<SubjectLine[]>([]);
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('draft');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setCode(initial.code ?? '');
      setName(initial.name ?? '');
      setDepartment(
        typeof initial.department === 'object' ? (initial.department as any)._id : initial.department
      );
      setDegreeType(initial.degreeType ?? 'Cử nhân');
      setDurationYears(initial.durationYears ?? 4);
      setTotalCredits(initial.totalCredits ?? 0);
      setRequiredCredits(initial.requiredCredits ?? 0);
      setElectiveCredits(initial.electiveCredits ?? 0);
      setOptionalCredits(initial.optionalCredits ?? 0);
      setEffectiveYear(initial.effectiveYear ?? new Date().getFullYear());
      setDescription(initial.description ?? '');
      setStatus(initial.status ?? 'draft');
      setLines(
        (initial.subjects ?? []).map((s) => ({
          uid: genUid(),
          subject: typeof s.subject === 'object' ? (s.subject as any)._id : s.subject,
          semester: s.semester,
          category: s.category ?? 'required',
          groupCode: s.groupCode ?? '',
        }))
      );
    }
  }, [mode, initial]);

  const addLine = () =>
    setLines((prev) => [...prev, { uid: genUid(), subject: '', semester: 1, category: 'required', groupCode: '' }]);

  const removeLine = (uid: string) => setLines((prev) => prev.filter((l) => l.uid !== uid));

  const updateLine = (uid: string, patch: Partial<SubjectLine>) =>
    setLines((prev) => prev.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!code.trim()) errs.code = t('curriculum.validation.maRequired');
    if (!name.trim()) errs.name = t('curriculum.validation.tenRequired');
    if (!department) errs.department = 'Vui lòng chọn khoa phụ trách';
    if (!totalCredits || totalCredits <= 0)
      errs.totalCredits = t('curriculum.validation.tongTcRequired');
    if (lines.length === 0) errs.subjects = 'Vui lòng thêm ít nhất một môn học';
    if (lines.some((l) => !l.subject)) errs.subjects = 'Vui lòng chọn đầy đủ môn học';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: CreateCurriculumInput = {
      code: code.trim(),
      name: name.trim(),
      department,
      degreeType,
      durationYears: Number(durationYears),
      totalCredits: Number(totalCredits),
      requiredCredits: Number(requiredCredits),
      electiveCredits: Number(electiveCredits),
      optionalCredits: Number(optionalCredits),
      subjects: lines.map((l) => ({
        subject: l.subject,
        semester: Number(l.semester),
        category: l.category,
        groupCode: l.groupCode || undefined,
      })),
      effectiveYear: Number(effectiveYear),
      description: description.trim() || undefined,
    };

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/sis/chuong-trinh-dao-tao'),
      });
    } else if (initial) {
      updateMutation.mutate(
        { id: initial._id, data: { ...payload, status } },
        {
          onSuccess: () =>
            navigate(`/sis/chuong-trinh-dao-tao/${initial._id}`),
        }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === 'create' ? t('curriculum.form.titleCreate') : `Chỉnh sửa: ${name || code}`}
        description={t('curriculum.form.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.titleList'), href: '/sis/chuong-trinh-dao-tao' },
          { label: mode === 'create' ? t('curriculum.breadcrumb.create') : 'Chỉnh sửa' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/sis/chuong-trinh-dao-tao')}>
            {t('curriculum.form.back')}
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">
              {t('curriculum.form.basicInfo')}
            </h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('curriculum.form.maCTDT')} required error={errors.code}>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('curriculum.form.codePlaceholder')}
              />
            </Field>
            <Field label={t('curriculum.form.tenChuongTrinh')} required error={errors.name}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('curriculum.form.namePlaceholder')}
              />
            </Field>

            <Field label="Khoa phụ trách" required error={errors.department}>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
              >
                <option value="">-- Chọn khoa --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t('curriculum.form.bacDaoTao')}>
              <select
                value={degreeType}
                onChange={(e) => setDegreeType(e.target.value as Curriculum['degreeType'])}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
              >
                {DEGREE_TYPES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Năm ban hành" required>
              <Input
                type="number"
                value={effectiveYear}
                onChange={(e) => setEffectiveYear(Number(e.target.value))}
                placeholder={t('curriculum.form.yearPlaceholder')}
              />
            </Field>

            {mode === 'edit' && (
              <Field label="Trạng thái">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="active">Đang áp dụng</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </Field>
            )}

            <div className="col-span-2">
              <Field label={t('curriculum.form.moTa')}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder={t('curriculum.form.descriptionPlaceholder')}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40 resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">
              {t('curriculum.form.params')}
            </h3>
          </div>
          <CardContent className="grid grid-cols-4 gap-4 pt-5">
            <Field label={t('curriculum.form.tongTinChi')} required error={errors.totalCredits}>
              <Input
                type="number"
                value={totalCredits}
                onChange={(e) => setTotalCredits(Number(e.target.value))}
                placeholder={t('curriculum.form.totalCreditsPlaceholder')}
              />
            </Field>
            <Field label="Tín chỉ bắt buộc">
              <Input
                type="number"
                value={requiredCredits}
                onChange={(e) => setRequiredCredits(Number(e.target.value))}
                placeholder="0"
              />
            </Field>
            <Field label="Tín chỉ lựa chọn">
              <Input
                type="number"
                value={electiveCredits}
                onChange={(e) => setElectiveCredits(Number(e.target.value))}
                placeholder="0"
              />
            </Field>
            <Field label="Tín chỉ tự chọn">
              <Input
                type="number"
                value={optionalCredits}
                onChange={(e) => setOptionalCredits(Number(e.target.value))}
                placeholder="0"
              />
            </Field>
            <Field label={t('curriculum.form.thoiGianDaoTao')}>
              <Input
                type="number"
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                placeholder={t('curriculum.form.durationPlaceholder')}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Danh sách môn học</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={addLine}
            >
              Thêm môn
            </Button>
          </div>
          <CardContent className="pt-5">
            {errors.subjects && (
              <p className="mb-3 text-xs text-[rgb(var(--error))]">{errors.subjects}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[rgb(var(--bg-base))]">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">
                      STT
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">
                      Môn học
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-[rgb(var(--text-secondary))]">
                      Học kỳ
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-[rgb(var(--text-secondary))]">
                      Loại
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-[rgb(var(--text-secondary))]">
                      Nhóm
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-[rgb(var(--text-secondary))]">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                  {lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-sm text-[rgb(var(--text-muted))]"
                      >
                        Chưa có môn học nào — nhấn "Thêm môn" ở góc phải.
                      </td>
                    </tr>
                  ) : (
                    lines.map((l, i) => (
                      <tr key={l.uid}>
                        <td className="px-3 py-2 text-[rgb(var(--text-secondary))]">{i + 1}</td>
                        <td className="px-3 py-2">
                          <select
                            value={l.subject}
                            onChange={(e) => updateLine(l.uid, { subject: e.target.value })}
                            className="h-9 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
                          >
                            <option value="">-- Chọn môn --</option>
                            {subjects.map((s: any) => (
                              <option key={s._id} value={s._id}>
                                {s.code} — {s.name} ({s.credits} TC)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={l.semester}
                            onChange={(e) =>
                              updateLine(l.uid, { semester: Number(e.target.value) })
                            }
                            className="h-9 w-20 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <select
                            value={l.category}
                            onChange={(e) => updateLine(l.uid, { category: e.target.value as SubjectCategory })}
                            className="h-9 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
                          >
                            {CATEGORY_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="text"
                            value={l.groupCode}
                            onChange={(e) => updateLine(l.uid, { groupCode: e.target.value })}
                            placeholder="VD: NL"
                            className="h-9 w-16 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(l.uid)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[rgb(var(--error))] hover:bg-[rgb(var(--bg-hover))]"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate('/sis/chuong-trinh-dao-tao')}
          >
            {t('curriculum.form.back')}
          </Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />} disabled={isSubmitting}>
            {isSubmitting
              ? 'Đang lưu...'
              : mode === 'create'
              ? t('curriculum.form.save')
              : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
