import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';

type SubjectType = 'theory' | 'practice' | 'project' | 'internship';

const SUBJECTS: Record<string, {
  code: string; name: string; credits: number; semester: number;
  hours: number; type: SubjectType; dept: string; status: 'active' | 'inactive';
  description: string; exam: string; prerequisites: string[];
}> = {
  'INT1005': { code: 'INT1005', name: 'Nhập môn Tin học', credits: 3, semester: 1, hours: 45, type: 'theory', dept: 'Khoa CNTT', status: 'active', description: 'Môn học giới thiệu các khái niệm cơ bản về tin học, hệ điều hành, mạng máy tính, và lập trình Python.', exam: 'Thi viết (90 phút)', prerequisites: [] },
  'INT2201': { code: 'INT2201', name: 'Cấu trúc dữ liệu', credits: 4, semester: 2, hours: 60, type: 'theory', dept: 'Khoa CNTT', status: 'active', description: 'Nghiên cứu các cấu trúc dữ liệu cơ bản: mảng, danh sách liên kết, cây, đồ thị.', exam: 'Thi viết (120 phút)', prerequisites: ['INT1005'] },
  'INT3110': { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 4, semester: 3, hours: 60, type: 'theory', dept: 'Khoa CNTT', status: 'active', description: 'Thiết kế CSDL quan hệ, ngôn ngữ SQL, tối ưu hóa truy vấn.', exam: 'Thi viết + Thực hành', prerequisites: ['INT2201'] },
  'INT3201': { code: 'INT3201', name: 'Mạng máy tính', credits: 3, semester: 3, hours: 45, type: 'practice', dept: 'Khoa CNTT', status: 'active', description: 'Mô hình OSI, TCP/IP, giao thức mạng, cấu hình router/switch.', exam: 'Thi thực hành (60 phút)', prerequisites: ['INT1005'] },
  'INT3301': { code: 'INT3301', name: 'Lập trình hướng đối tượng', credits: 4, semester: 2, hours: 60, type: 'practice', dept: 'Khoa CNTT', status: 'active', description: 'Các nguyên lý lập trình hướng đối tượng với Java.', exam: 'Thi thực hành (90 phút)', prerequisites: ['INT1005'] },
  'INT3401': { code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3, semester: 5, hours: 45, type: 'theory', dept: 'Khoa CNTT', status: 'active', description: 'Các thuật toán tìm kiếm, logic mờ, mạng neural, học máy cơ bản.', exam: 'Thi viết (90 phút)', prerequisites: ['INT2201', 'GEN2011'] },
  'INT3501': { code: 'INT3501', name: 'An toàn thông tin', credits: 3, semester: 4, hours: 45, type: 'theory', dept: 'Khoa CNTT', status: 'inactive', description: 'Mã hóa dữ liệu, bảo mật mạng, tấn công và phòng thủ.', exam: 'Thi viết (90 phút)', prerequisites: ['INT3201'] },
  'INT4001': { code: 'INT4001', name: 'Đồ án tốt nghiệp', credits: 10, semester: 8, hours: 300, type: 'project', dept: 'Khoa CNTT', status: 'active', description: 'Đồ án tốt nghiệp dưới hướng dẫn của giảng viên.', exam: 'Bảo vệ trước hội đồng', prerequisites: [] },
  'GEN1011': { code: 'GEN1011', name: 'Toán cao cấp A1', credits: 4, semester: 1, hours: 60, type: 'theory', dept: 'Khoa Khoa học', status: 'active', description: 'Giải tích hàm một biến.', exam: 'Thi viết (120 phút)', prerequisites: [] },
  'GEN1012': { code: 'GEN1012', name: 'Tiếng Anh A1', credits: 3, semester: 1, hours: 45, type: 'practice', dept: 'Khoa Ngoại ngữ', status: 'active', description: 'Tiếng Anh cơ bản.', exam: 'Thi thực hành', prerequisites: [] },
  'GEN2011': { code: 'GEN2011', name: 'Xác suất thống kê', credits: 3, semester: 3, hours: 45, type: 'theory', dept: 'Khoa Khoa học', status: 'active', description: 'Xác suất cơ bản, biến ngẫu nhiên, ước lượng thống kê.', exam: 'Thi viết (90 phút)', prerequisites: ['GEN1011'] },
  'INT4002': { code: 'INT4002', name: 'Thực tập tốt nghiệp', credits: 5, semester: 8, hours: 150, type: 'internship', dept: 'Khoa CNTT', status: 'active', description: 'Thực tập tại doanh nghiệp IT.', exam: 'Báo cáo thực tập', prerequisites: [] },
};

const TYPE_OPTIONS = ['Lý thuyết', 'Thực hành', 'Đồ án', 'Thực tập'];
const DEPARTMENTS = ['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược', 'Phòng Đào tạo', 'Khoa Khoa học'];
const TYPE_MAP: Record<string, SubjectType> = { 'Lý thuyết': 'theory', 'Thực hành': 'practice', 'Đồ án': 'project', 'Thực tập': 'internship' };

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
        {label}{required && <span className="text-[rgb(var(--error))] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[rgb(var(--error))]">{error}</p>}
    </div>
  );
}

export default function SubjectEdit() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const code = window.location.pathname.split('/').filter(Boolean).pop()?.replace('/sua', '') ?? 'INT1005';
  const original = SUBJECTS[code] ?? SUBJECTS['INT1005'];

  const [form, setForm] = useState({
    code: original.code,
    name: original.name,
    credits: original.credits.toString(),
    hours: original.hours.toString(),
    semester: original.semester.toString(),
    type: TYPE_OPTIONS.find((t) => TYPE_MAP[t] === original.type) ?? 'Lý thuyết',
    dept: original.dept,
    exam: original.exam,
    description: original.description,
    status: original.status === 'active' ? 'Hoạt động' : 'Không hoạt động',
  });
  const [prerequisites, setPrerequisites] = useState<string[]>(original.prerequisites);
  const [preInput, setPreInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const addPre = () => {
    if (preInput.trim() && !prerequisites.includes(preInput.trim())) {
      setPrerequisites((p) => [...p, preInput.trim()]);
      setPreInput('');
    }
  };
  const removePre = (c: string) => setPrerequisites((p) => p.filter((x) => x !== c));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = t('subject.validation.maMonRequired');
    if (!form.name.trim()) e.name = t('subject.validation.tenMonRequired');
    if (!form.credits) e.credits = t('subject.validation.soTinChiRequired');
    if (!form.semester) e.semester = t('subject.validation.hocKyRequired');
    if (!form.dept) e.dept = t('subject.validation.khoaRequired');
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/sis/chuong-trinh-dao-tao/mon-hoc');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('subject.form.titleEdit', { name: original.name })}
        description={t('subject.form.descriptionEdit', { code: original.code })}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.titleList'), href: '/sis/chuong-trinh-dao-tao' },
          { label: t('subject.titleList'), href: '/sis/chuong-trinh-dao-tao/mon-hoc' },
          { label: original.code },
          { label: t('subject.breadcrumb.edit') },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/sis/chuong-trinh-dao-tao/mon-hoc')}>{t('subject.form.back')}</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Thông tin môn học */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('subject.form.info')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('subject.form.maMon')} required error={errors.code}>
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="INT1005" error={errors.code} />
            </Field>
            <Field label={t('subject.form.tenMon')} required error={errors.name}>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('subject.form.soTinChi')} required error={errors.credits}>
                <Input type="number" value={form.credits} onChange={(e) => set('credits', e.target.value)} error={errors.credits} />
              </Field>
              <Field label={t('subject.form.soTietHoc')}>
                <Input type="number" value={form.hours} onChange={(e) => set('hours', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('subject.form.hocKy')} required error={errors.semester}>
                <Input type="number" value={form.semester} onChange={(e) => set('semester', e.target.value)} error={errors.semester} />
              </Field>
              <Field label={t('subject.form.loaiMonHoc')}>
                <select
                  value={form.type}
                  onChange={(e) => set('type', e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                >
                  {TYPE_OPTIONS.map((tOpt) => <option key={tOpt}>{tOpt}</option>)}
                </select>
              </Field>
            </div>
            <Field label={t('subject.form.khoaPhuTrach')} required error={errors.dept}>
              <select
                value={form.dept}
                onChange={(e) => set('dept', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                <option value="">{t('subject.form.chuanKhoa')}</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label={t('subject.form.hinhThucThi')}>
              <Input value={form.exam} onChange={(e) => set('exam', e.target.value)} placeholder={t('subject.form.examPlaceholder')} />
            </Field>
            <Field label={t('subject.form.trangThai')}>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                <option>{t('subject.status.active')}</option>
                <option>{t('subject.status.inactive')}</option>
              </select>
            </Field>
            <div className="col-span-2">
              <Field label={t('subject.form.moTa')}>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Môn học tiên quyết */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('subject.form.monTienQuyet')}</h3>
          </div>
          <CardContent className="space-y-3 pt-5">
            {prerequisites.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((c) => (
                  <div key={c} className="flex items-center gap-1.5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-1 text-sm text-[rgb(var(--text-primary))]">
                    <span className="font-mono text-xs">{c}</span>
                    <button onClick={() => removePre(c)} className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--error))]">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder={t('subject.form.prerequisitePlaceholder')}
                value={preInput}
                onChange={(e) => setPreInput(e.target.value)}
                wrapperClassName="flex-1"
              />
              <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={addPre} type="button">{t('subject.form.addPrerequisite')}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/chuong-trinh-dao-tao/mon-hoc')}>{t('subject.form.back')}</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>{t('subject.form.saveChanges')}</Button>
        </div>
      </form>
    </div>
  );
}
