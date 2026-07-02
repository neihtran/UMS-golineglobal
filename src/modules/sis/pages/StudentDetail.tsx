import { useState } from 'react';
import {
  BookOpen,
  Award,
  ArrowLeft,
  Download,
  Edit2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SUBJECTS = [
  { id: 's1', code: 'CS101', name: 'Nhập môn Lập trình Python', credits: 4, semester: 1, type: 'Bắt buộc', dept: 'Khoa CNTT', hours: 60 },
  { id: 's2', code: 'CS102', name: 'Cấu trúc dữ liệu và Giải thuật', credits: 4, semester: 2, type: 'Bắt buộc', dept: 'Khoa CNTT', hours: 60 },
  { id: 's3', code: 'CS201', name: 'Cơ sở dữ liệu', credits: 3, semester: 3, type: 'Bắt buộc', dept: 'Khoa CNTT', hours: 45 },
  { id: 's4', code: 'CS202', name: 'Mạng máy tính', credits: 3, semester: 4, type: 'Bắt buộc', dept: 'Khoa CNTT', hours: 45 },
  { id: 's5', code: 'CS301', name: 'Trí tuệ Nhân tạo', credits: 3, semester: 5, type: 'Tự chọn', dept: 'Khoa CNTT', hours: 45 },
  { id: 's6', code: 'MATH101', name: 'Toán cao cấp 1', credits: 4, semester: 1, type: 'Bắt buộc', dept: 'Khoa CNTT', hours: 60 },
  { id: 's7', code: 'MATH102', name: 'Toán cao cấp 2', credits: 4, semester: 2, type: 'Bắt buộc', dept: 'Khoa CNTT', hours: 60 },
  { id: 's8', code: 'ENG101', name: 'Tiếng Anh cơ bản', credits: 3, semester: 1, type: 'Bắt buộc', dept: 'Khoa Ngoại ngữ', hours: 45 },
];

const GRADE_RECORDS = [
  { subjectCode: 'CS101', name: 'Nhập môn Lập trình Python', semester: '2022-1', theory: 8.5, practice: 9.0, final: 8.7, grade: 'A', credits: 4 },
  { subjectCode: 'MATH101', name: 'Toán cao cấp 1', semester: '2022-1', theory: 7.5, practice: null, final: 7.5, grade: 'B+', credits: 4 },
  { subjectCode: 'ENG101', name: 'Tiếng Anh cơ bản', semester: '2022-1', theory: 8.0, practice: 8.5, final: 8.2, grade: 'A', credits: 3 },
  { subjectCode: 'CS102', name: 'Cấu trúc dữ liệu và Giải thuật', semester: '2022-2', theory: 7.0, practice: 7.5, final: 7.2, grade: 'B', credits: 4 },
  { subjectCode: 'MATH102', name: 'Toán cao cấp 2', semester: '2022-2', theory: 6.5, practice: null, final: 6.5, grade: 'C+', credits: 4 },
  { subjectCode: 'CS201', name: 'Cơ sở dữ liệu', semester: '2023-1', theory: 8.0, practice: 8.5, final: 8.2, grade: 'A', credits: 3 },
];

const STUDENT = {
  id: 'sv001', msv: 'SV-2022-0001', name: 'Nguyễn Văn An', dob: '2004-05-12',
  class: 'CNTT-K60A', major: 'Công nghệ thông tin', dept: 'Khoa CNTT',
  cohort: '2022', gpa: 3.45, credits: 98, status: 'studying',
  address: '48/5 Đường Lê Văn Việt, Quận 9, TP.HCM', phone: '0912 345 678',
  email: 'an.nguyen@student.truong.edu.vn',
  enrollmentDate: '2022-09-01', expectedGraduation: '2026-06-30',
};

const TYPE_BADGE: Record<string, 'primary' | 'accent' | 'neutral'> = {
  'Bắt buộc': 'primary',
  'Tự chọn': 'accent',
};

export default function StudentDetail() {
  const { t } = useTranslation('sis');
  const [activeTab, setActiveTab] = useState('profile');
  const s = STUDENT;

  const tabs = [
    { id: 'profile', label: t('student.detail.profile') },
    { id: 'grades', label: t('student.detail.grades') },
    { id: 'ctdt', label: t('student.detail.ctdt') },
    { id: 'schedule', label: t('student.detail.schedule') },
    { id: 'certificates', label: t('student.detail.certificates') },
  ];

  const profileFields = [
    { labelKey: 'student.detail.profileFields.hoVaTen', value: s.name },
    { labelKey: 'student.detail.profileFields.maSinhVien', value: s.msv },
    { labelKey: 'student.detail.profileFields.ngaySinh', value: s.dob },
    { labelKey: 'student.detail.profileFields.gioiTinh', value: 'Nam' },
    { labelKey: 'student.detail.profileFields.diaChi', value: s.address },
    { labelKey: 'student.detail.profileFields.dienThoai', value: s.phone },
  ];

  const gradeStats = [
    { labelKey: 'student.detail.gpaTichLuy', value: s.gpa.toFixed(2) },
    { labelKey: 'student.detail.tinChiDat', value: s.credits.toString() },
    { labelKey: 'student.detail.xeploai', value: 'Giỏi' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={s.name}
        description={`${s.msv} · ${s.major} · ${s.class}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('student.breadcrumb.list'), href: '/sis/sinh-vien' },
          { label: s.name },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => history.back()}>{t('student.detail.back')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('student.detail.exportProfile')}</Button>
            <Button leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => window.location.href = `/sis/sinh-vien/${s.id}/sua`}>{t('student.detail.edit')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-2xl font-bold text-white mb-4 ring-4 ring-[rgb(var(--primary)/0.2)]">
                {s.name.split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">{s.name}</h2>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{s.msv}</p>
              <Badge variant="success" dot className="mt-2">{t('student.status.studying')}</Badge>
              <div className="mt-6 w-full space-y-2.5">
                {[
                  { label: t('student.detail.profileFields.ngaySinh'), value: s.dob },
                  { label: t('student.table.lop'), value: s.class },
                  { label: t('student.table.nganhKhoa').split(' / ')[1] || t('student.table.nganhKhoa'), value: s.dept },
                  { label: t('student.form.khoaHoc'), value: s.cohort },
                  { label: t('student.table.gpa'), value: `${s.gpa.toFixed(2)} / 4.0` },
                  { label: 'Tín chỉ tích lũy', value: `${s.credits} TC` },
                  { label: t('student.detail.profileFields.gioiTinh') === 'Giới tính' ? 'Email' : 'Email', value: s.email },
                  { label: t('student.detail.profileFields.dienThoai'), value: s.phone },
                  { label: t('student.form.ngayNhapHoc'), value: s.enrollmentDate },
                  { label: t('student.form.duKienTotNghiep'), value: s.expectedGraduation },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs border-b border-[rgb(var(--border)/0.4)] pb-2 last:border-0 last:pb-0">
                    <span className="text-[rgb(var(--text-muted))]">{label}</span>
                    <span className="font-medium text-[rgb(var(--text-primary))] text-right max-w-[140px] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <Card>
            <div className="border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex gap-1 px-4 pt-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                        : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {/* Profile tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {profileFields.map(({ labelKey, value }) => (
                      <div key={labelKey} className="border-b border-[rgb(var(--border)/0.4)] pb-2">
                        <p className="text-[10px] uppercase tracking-wide text-[rgb(var(--text-muted))]">{t(labelKey)}</p>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grades tab */}
              {activeTab === 'grades' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      {gradeStats.map(({ labelKey, value }) => (
                        <div key={labelKey} className="text-center">
                          <p className="text-xs text-[rgb(var(--text-muted))]">{t(labelKey)}</p>
                          <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{value}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('student.detail.xuatBangDiem')}</Button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-[rgb(var(--border))]">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeadCell>{t('student.detail.bangDiem.maMon')}</TableHeadCell>
                          <TableHeadCell>{t('student.detail.bangDiem.tenMon')}</TableHeadCell>
                          <TableHeadCell>{t('student.detail.bangDiem.ky')}</TableHeadCell>
                          <TableHeadCell className="text-right">{t('student.detail.bangDiem.lt')}</TableHeadCell>
                          <TableHeadCell className="text-right">{t('student.detail.bangDiem.th')}</TableHeadCell>
                          <TableHeadCell className="text-right">{t('student.detail.bangDiem.diemGK')}</TableHeadCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {GRADE_RECORDS.map((g) => (
                          <TableRow key={`${g.subjectCode}-${g.semester}`}>
                            <TableCell className="font-mono text-xs">{g.subjectCode}</TableCell>
                            <TableCell className="text-sm">{g.name}</TableCell>
                            <TableCell>{g.semester}</TableCell>
                            <TableCell>{g.theory?.toFixed(1) ?? '—'}</TableCell>
                            <TableCell>{g.practice?.toFixed(1) ?? '—'}</TableCell>
                            <TableCell className="font-semibold">{g.final.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* CTDT tab */}
              {activeTab === 'ctdt' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('student.detail.ctdtTitle')}</h4>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{t('student.detail.ctdtNote', { credits: 140, cohort: 2022 })}</p>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('student.detail.xuatCTDT')}</Button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-[rgb(var(--border))]">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeadCell>{t('student.detail.bangDiemCTDT.maMon')}</TableHeadCell>
                          <TableHeadCell>{t('student.detail.bangDiemCTDT.tenMon')}</TableHeadCell>
                          <TableHeadCell>{t('student.detail.bangDiemCTDT.tc')}</TableHeadCell>
                          <TableHeadCell>{t('student.detail.bangDiemCTDT.ky')}</TableHeadCell>
                          <TableHeadCell>{t('student.detail.bangDiemCTDT.loai')}</TableHeadCell>
                          <TableHeadCell>{t('student.detail.bangDiemCTDT.gio')}</TableHeadCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {SUBJECTS.map((subj) => (
                          <TableRow key={subj.id}>
                            <TableCell className="font-mono text-xs">{subj.code}</TableCell>
                            <TableCell className="text-sm">{subj.name}</TableCell>
                            <TableCell className="text-right">{subj.credits}</TableCell>
                            <TableCell>{subj.semester}</TableCell>
                            <TableCell><Badge variant={TYPE_BADGE[subj.type] ?? 'neutral'} size="sm">{subj.type}</Badge></TableCell>
                            <TableCell className="text-right">{subj.hours}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Schedule tab */}
              {activeTab === 'schedule' && (
                <div className="flex flex-col items-center py-10 text-center">
                  <BookOpen className="h-12 w-12 text-[rgb(var(--text-muted))] mb-3" />
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t('student.detail.xemLichHoc')}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('student.detail.lichHocNote')}</p>
                  <Button variant="outline" size="sm" className="mt-4">{t('student.detail.moLMS')}</Button>
                </div>
              )}

              {/* Certificates tab */}
              {activeTab === 'certificates' && (
                <div className="space-y-3">
                  {[
                    { name: 'Chứng chỉ hoàn thành CTĐT năm 2', date: '2024-06-30', status: 'issued' },
                    { name: 'Bằng tốt nghiệp dự kiến', date: '2026-06-30', status: 'pending' },
                  ].map((cert, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] p-3">
                      <Award className="h-8 w-8 text-[rgb(var(--warning))]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{cert.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{cert.date}</p>
                      </div>
                      <Badge variant={cert.status === 'issued' ? 'success' : 'neutral'} size="sm">
                        {cert.status === 'issued' ? t('student.detail.certificateStatus.issued') : t('student.detail.certificateStatus.pending')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
