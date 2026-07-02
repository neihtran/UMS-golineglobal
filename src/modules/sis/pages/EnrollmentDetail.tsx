import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const ENROLLMENT = {
  id: 'er01', studentId: 'SV-2024-0142', studentName: 'Nguyễn Minh Tuấn',
  class: 'CNTT-K24', major: 'Công nghệ thông tin', dept: 'Khoa CNTT',
  semester: 'HK2/2025-2026', registerDate: '2026-01-15',
  approvedBy: 'ThS. Trần Văn B', approvedAt: '2026-01-16',
  status: 'registered',
};

const COURSES = [
  { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 4, type: 'Lý thuyết', dept: 'Khoa CNTT', result: 'passed', score: 8.5 },
  { code: 'INT3201', name: 'Mạng máy tính', credits: 3, type: 'Thực hành', dept: 'Khoa CNTT', result: 'passed', score: 7.8 },
  { code: 'GEN2011', name: 'Xác suất thống kê', credits: 3, type: 'Lý thuyết', dept: 'Khoa Khoa học', result: 'passed', score: 7.2 },
  { code: 'GEN2012', name: 'Tư tưởng HCM', credits: 2, type: 'Lý thuyết', dept: 'Khoa Khoa học', result: 'passed', score: 8.0 },
  { code: 'INT3301', name: 'Lập trình hướng đối tượng', credits: 4, type: 'Thực hành', dept: 'Khoa CNTT', result: 'in_progress', score: null },
  { code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3, type: 'Lý thuyết', dept: 'Khoa CNTT', result: 'registered', score: null },
  { code: 'INT3501', name: 'An toàn thông tin', credits: 3, type: 'Lý thuyết', dept: 'Khoa CNTT', result: 'registered', score: null },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
  registered: { variant: 'info', label: 'Đã đăng ký' },
  in_progress: { variant: 'warning', label: 'Đang học' },
  passed: { variant: 'success', label: 'Đạt' },
  failed: { variant: 'error', label: 'Không đạt' },
  withdrawn: { variant: 'neutral', label: 'Đã rút' },
};

const RESULT_BADGE: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  registered: 'info', in_progress: 'warning', passed: 'success', failed: 'error', withdrawn: 'neutral',
};

export default function EnrollmentDetail() {
  const { t } = useTranslation('sis');
  const e = ENROLLMENT;
  const sc = STATUS_CONFIG[e.status];
  const passed = COURSES.filter((c) => c.result === 'passed');
  const totalCredits = COURSES.reduce((acc, c) => acc + c.credits, 0);
  const earnedCredits = passed.reduce((acc, c) => acc + c.credits, 0);
  const avgScore = passed.length > 0
    ? (passed.reduce((acc, c) => acc + (c.score ?? 0), 0) / passed.length).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t('enrollment.title')} HK2/2025-2026 — ${e.studentName}`}
        description={`${e.studentId} · ${e.class} · ${e.major}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('enrollment.titleList'), href: '/sis/dang-ky-hoc-phan' },
          { label: e.studentName },
        ]}
        actions={
          <>
            <Link to="/sis/dang-ky-hoc-phan">
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>{t('enrollment.detail.back')}</Button>
            </Link>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('enrollment.detail.print')}</Button>
            <Button leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => window.location.href = `/sis/dang-ky-hoc-phan/${e.id}/sua`}>{t('enrollment.detail.edit')}</Button>
          </>
        }
      />

      {/* Info row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([
          { labelKey: 'enrollment.detail.mssv', value: e.studentId },
          { labelKey: 'enrollment.table.hocKy', value: e.semester },
          { labelKey: 'enrollment.detail.ngayDangKy', value: e.registerDate },
          { labelKey: 'enrollment.detail.nguoiDuyet', value: e.approvedBy },
        ] as { labelKey: string; value: string }[]).map(({ labelKey, value }) => (
          <Card key={labelKey}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{t(labelKey)}</p>
              <p className="mt-1 text-sm font-semibold text-[rgb(var(--text-primary))]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Tổng tín chỉ đăng ký', value: totalCredits },
          { label: 'Tín chỉ đã đạt', value: earnedCredits },
          { label: 'Điểm TB (học phần đạt)', value: avgScore ?? '—' },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
              <p className="mt-1 text-xl font-bold text-[rgb(var(--text-primary))]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Thông tin SV */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin sinh viên</h3>
          <Badge variant={sc.variant} dot>{sc.label}</Badge>
        </div>
        <CardContent className="pt-5 grid grid-cols-3 gap-4">
          {[
            { label: 'Họ tên', value: e.studentName },
            { label: 'Mã sinh viên', value: e.studentId },
            { label: 'Lớp', value: e.class },
            { label: 'Ngành', value: e.major },
            { label: 'Khoa', value: e.dept },
            { label: 'Người duyệt / Duyệt lúc', value: `${e.approvedBy} · ${e.approvedAt}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{label}</p>
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danh sách học phần */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Danh sách học phần đã đăng ký</h3>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{COURSES.length} học phần · {totalCredits} tín chỉ</p>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>STT</TableHeadCell>
              <TableHeadCell>Mã học phần</TableHeadCell>
              <TableHeadCell>Tên học phần</TableHeadCell>
              <TableHeadCell>Tín chỉ</TableHeadCell>
              <TableHeadCell>Loại</TableHeadCell>
              <TableHeadCell>Khoa</TableHeadCell>
              <TableHeadCell>Kết quả</TableHeadCell>
              <TableHeadCell className="text-right">Điểm</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {COURSES.map((c, i) => (
              <TableRow key={c.code}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">{i + 1}</TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{c.code}</TableCell>
                <TableCell className="font-medium text-[rgb(var(--text-primary))]">{c.name}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{c.credits}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{c.type}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{c.dept}</TableCell>
                <TableCell>
                  <Badge variant={RESULT_BADGE[c.result]} size="sm">
                    {STATUS_CONFIG[c.result].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {c.score !== null ? (
                    <span className={`font-bold ${c.score >= 8.5 ? 'text-[rgb(var(--success))]' : c.score >= 7.0 ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--warning))]'}`}>
                      {c.score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[rgb(var(--text-muted))]">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
