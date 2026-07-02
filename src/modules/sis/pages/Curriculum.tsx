import { useState } from 'react';
import { Download, Plus, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const TYPE_COLORS: Record<string, 'info' | 'accent' | 'warning' | 'primary'> = {
  theory: 'info', practice: 'accent', project: 'warning', internship: 'primary',
};

// Môn học theo từng CTĐT
const PROGRAM_SUBJECTS: Record<string, { code: string; name: string; credits: number; semester: number; type: string; dept: string }[]> = {
  ct1: [
    { code: 'INT1005', name: 'Nhập môn Tin học', credits: 3, semester: 1, type: 'theory', dept: 'Khoa CNTT' },
    { code: 'INT2201', name: 'Cấu trúc dữ liệu', credits: 4, semester: 2, type: 'theory', dept: 'Khoa CNTT' },
    { code: 'INT3301', name: 'Lập trình hướng đối tượng', credits: 4, semester: 2, type: 'practice', dept: 'Khoa CNTT' },
    { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 4, semester: 3, type: 'theory', dept: 'Khoa CNTT' },
    { code: 'INT3201', name: 'Mạng máy tính', credits: 3, semester: 3, type: 'practice', dept: 'Khoa CNTT' },
    { code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3, semester: 5, type: 'theory', dept: 'Khoa CNTT' },
    { code: 'INT4001', name: 'Đồ án tốt nghiệp', credits: 10, semester: 8, type: 'project', dept: 'Khoa CNTT' },
  ],
  ct2: [
    { code: 'KT1005', name: 'Kinh tế vi mô', credits: 3, semester: 1, type: 'theory', dept: 'Khoa Kinh tế' },
    { code: 'KT2001', name: 'Kinh tế vĩ mô', credits: 3, semester: 2, type: 'theory', dept: 'Khoa Kinh tế' },
    { code: 'KT2101', name: 'Nguyên lý kế toán', credits: 3, semester: 1, type: 'theory', dept: 'Khoa Kinh tế' },
    { code: 'KT3001', name: 'Tài chính doanh nghiệp', credits: 4, semester: 3, type: 'theory', dept: 'Khoa Kinh tế' },
    { code: 'KT3201', name: 'Marketing căn bản', credits: 3, semester: 2, type: 'practice', dept: 'Khoa Kinh tế' },
    { code: 'KT4001', name: 'Luận văn tốt nghiệp', credits: 10, semester: 8, type: 'project', dept: 'Khoa Kinh tế' },
  ],
  ct3: [
    { code: 'LT1005', name: 'Luật hiến pháp', credits: 3, semester: 1, type: 'theory', dept: 'Khoa Luật' },
    { code: 'LT2001', name: 'Luật hành chính', credits: 3, semester: 2, type: 'theory', dept: 'Khoa Luật' },
    { code: 'LT2101', name: 'Luật dân sự 1', credits: 4, semester: 2, type: 'theory', dept: 'Khoa Luật' },
    { code: 'LT3101', name: 'Luật hình sự', credits: 4, semester: 3, type: 'theory', dept: 'Khoa Luật' },
    { code: 'LT3201', name: 'Tố tụng hình sự', credits: 3, semester: 4, type: 'practice', dept: 'Khoa Luật' },
    { code: 'LT4001', name: 'Luận văn tốt nghiệp', credits: 10, semester: 8, type: 'project', dept: 'Khoa Luật' },
  ],
  ct4: [
    { code: 'NN1005', name: 'Tiếng Anh A1', credits: 3, semester: 1, type: 'practice', dept: 'Khoa Ngoại ngữ' },
    { code: 'NN2001', name: 'Tiếng Anh B1', credits: 3, semester: 2, type: 'practice', dept: 'Khoa Ngoại ngữ' },
    { code: 'NN2101', name: 'Ngữ pháp nâng cao', credits: 3, semester: 2, type: 'theory', dept: 'Khoa Ngoại ngữ' },
    { code: 'NN3001', name: 'Dịch thuật căn bản', credits: 4, semester: 3, type: 'practice', dept: 'Khoa Ngoại ngữ' },
    { code: 'NN4001', name: 'Đồ án tốt nghiệp', credits: 10, semester: 8, type: 'project', dept: 'Khoa Ngoại ngữ' },
  ],
  ct5: [
    { code: 'SP1005', name: 'Tâm lý học đại cương', credits: 3, semester: 1, type: 'theory', dept: 'Khoa Sư phạm' },
    { code: 'SP2001', name: 'Giáo dục học', credits: 3, semester: 2, type: 'theory', dept: 'Khoa Sư phạm' },
    { code: 'SP2101', name: 'Sư phạm lý luận', credits: 3, semester: 2, type: 'practice', dept: 'Khoa Sư phạm' },
    { code: 'SP3101', name: 'Phương pháp giảng dạy', credits: 4, semester: 3, type: 'theory', dept: 'Khoa Sư phạm' },
    { code: 'SP3201', name: 'Thực tập sư phạm', credits: 5, semester: 7, type: 'internship', dept: 'Khoa Sư phạm' },
    { code: 'SP4001', name: 'Đồ án tốt nghiệp', credits: 10, semester: 8, type: 'project', dept: 'Khoa Sư phạm' },
  ],
};

const PROGRAMS = [
  { id: 'ct1', code: 'CTDT-CNTT-2021', name: 'Chương trình đào tạo CNTT', version: 'V3.0', year: 2021, totalCredits: 120, minGPA: 2.0, status: 'active', subjects: 48 },
  { id: 'ct2', code: 'CTDT-KT-2021', name: 'Chương trình đào tạo Kinh tế', version: 'V2.0', year: 2021, totalCredits: 120, minGPA: 2.0, status: 'active', subjects: 45 },
  { id: 'ct3', code: 'CTDT-LUAT-2020', name: 'Chương trình đào tạo Luật', version: 'V1.0', year: 2020, totalCredits: 130, minGPA: 2.0, status: 'active', subjects: 52 },
  { id: 'ct4', code: 'CTDT-NN-2022', name: 'Chương trình đào tạo Ngoại ngữ', version: 'V1.0', year: 2022, totalCredits: 115, minGPA: 2.0, status: 'active', subjects: 44 },
  { id: 'ct5', code: 'CTDT-SP-2019', name: 'Chương trình đào tạo Sư phạm', version: 'V2.0', year: 2019, totalCredits: 140, minGPA: 2.0, status: 'archived', subjects: 58 },
];

export default function Curriculum() {
  const { t } = useTranslation('sis');
  const [selectedId, setSelectedId] = useState<string>('ct1');
  const selectedProgram = PROGRAMS.find((p) => p.id === selectedId)!;
  const subjects = PROGRAM_SUBJECTS[selectedId] ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('curriculum.title')}
        description={t('curriculum.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.breadcrumb.list') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('curriculum.export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => window.location.href = '/sis/chuong-trinh-dao-tao/tao'}>{t('curriculum.add')}</Button>
          </>
        }
      />

      {/* Programs table */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('curriculum.listTitle')}</h3>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>{t('curriculum.table.maCTDT')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.table.tenCTDT')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.table.phienBan')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.table.nam')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.table.tongTc')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.tongMonHoc')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.table.gpaToiThieu')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.table.trangThai')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.table.thaoTac')}</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PROGRAMS.map((p) => (
              <TableRow
                key={p.id}
                className="hover:bg-[rgb(var(--bg-hover))]"
                onClick={() => setSelectedId(p.id)}
              >
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{p.code}</TableCell>
                <TableCell className="font-medium text-[rgb(var(--text-primary))]">{p.name}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{p.version}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{p.year}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{p.totalCredits}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{p.subjects}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{p.minGPA.toFixed(1)}</TableCell>
                <TableCell>
                  <Badge variant={p.status === 'active' ? 'success' : 'neutral'} dot size="sm">
                    {p.status === 'active' ? t('curriculum.status.active') : t('curriculum.status.inactive')}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="h-3.5 w-3.5" />}
                      onClick={() => window.location.href = `/sis/chuong-trinh-dao-tao/${p.id}`}
                    >
                      {t('curriculum.chiTiet')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Subjects of selected CTDT */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('curriculum.subjectListTitle')}</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
              {t('curriculum.subjectListNote', { name: selectedProgram.name, version: selectedProgram.version })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[rgb(var(--text-muted))]">{t('curriculum.viewSelect')}</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2.5 text-xs text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
            >
              {PROGRAMS.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
            </select>
            <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => window.location.href = '/sis/chuong-trinh-dao-tao/mon-hoc'}>
              {t('curriculum.subjectListLink')}
            </Button>
          </div>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>{t('curriculum.tableDetail.maMon')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.tableDetail.tenMon')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.tableDetail.tongTc')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.tableDetail.hocKy')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.tableDetail.loai')}</TableHeadCell>
              <TableHeadCell>{t('curriculum.tableDetail.khoa')}</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-[rgb(var(--text-muted))]">
                  {t('curriculum.empty.noSubjects')}
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((s) => (
                <TableRow key={s.code}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{s.code}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{s.name}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.credits}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.semester}</TableCell>
                  <TableCell>
                    <Badge variant={TYPE_COLORS[s.type]} size="sm">{s.type}</Badge>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.dept}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
