import { useState } from 'react';
import { Download, Plus, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useCurriculumList, useSubjectList } from '@/hooks/useSis';

const TYPE_COLORS: Record<string, 'info' | 'accent' | 'warning' | 'primary'> = {
  theory: 'info', practice: 'accent', project: 'warning', internship: 'primary',
};

export default function Curriculum() {
  const { t } = useTranslation('sis');
  const [selectedId, setSelectedId] = useState<string>('');

  const { data: curriculumData, isLoading: curLoading } = useCurriculumList({ pageSize: 100 });
  const { data: subjectData, isLoading: subLoading } = useSubjectList({ pageSize: 500 });
  const curriculums = curriculumData?.data ?? [];
  const subjects = subjectData?.data ?? [];

  const selected = curriculums.find((c: any) => c._id === selectedId);
  const filteredSubjects = selectedId
    ? subjects.filter((s: any) => s.curriculumId === selectedId || s.curriculum === selectedId)
    : subjects.slice(0, 50);

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
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('curriculum.add')}</Button>
          </>
        }
      />

      {/* Programs table */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary)]">{t('curriculum.listTitle')}</h3>
        </div>
        {curLoading ? (
          <TableSkeleton colSpan={9} rows={5} />
        ) : curriculums.length === 0 ? (
          <div className="p-8 text-center text-sm text-[rgb(var(--text-muted)]">Chưa có chương trình đào tạo nào.</div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>{t('curriculum.table.maCTDT')}</TableHeadCell>
                <TableHeadCell>{t('curriculum.table.tenCTDT')}</TableHeadCell>
                <TableHeadCell>{t('curriculum.table.nam')}</TableHeadCell>
                <TableHeadCell>{t('curriculum.table.tongTc')}</TableHeadCell>
                <TableHeadCell>{t('curriculum.table.trangThai')}</TableHeadCell>
                <TableHeadCell>{t('curriculum.table.thaoTac')}</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {curriculums.map((p: any) => (
                <TableRow
                  key={p._id}
                  className={`hover:bg-[rgb(var(--bg-hover))] cursor-pointer ${selectedId === p._id ? 'bg-[rgb(var(--primary)/0.04)]' : ''}`}
                  onClick={() => setSelectedId(selectedId === p._id ? '' : p._id)}
                >
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary)]">{p.code}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary)]">{p.name}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary)]">{p.startYear}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary)]">{p.totalCredits}</TableCell>
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
                        onClick={() => setSelectedId(p._id)}
                      >
                        {t('curriculum.chiTiet')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Subjects of selected CTDT */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[rgb(var(--text-primary)]">
              {selected ? `${selected.name} (${selected.code})` : t('curriculum.subjectListTitle')}
            </h3>
            {selected && (
              <p className="text-xs text-[rgb(var(--text-muted)] mt-0.5">
                {t('curriculum.subjectListNote', { name: selected.name, version: selected.code })} · {selected.totalCredits} tín chỉ
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2.5 text-xs text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
            >
              <option value="">{t('curriculum.viewSelectAll')}</option>
              {curriculums.map((p: any) => <option key={p._id} value={p._id}>{p.code} — {p.name}</option>)}
            </select>
            <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              {t('curriculum.subjectListLink')}
            </Button>
          </div>
        </div>
        {subLoading ? (
          <TableSkeleton colSpan={6} rows={5} />
        ) : (
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
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-[rgb(var(--text-muted)]">
                    {selectedId ? t('curriculum.empty.noSubjects') : 'Chưa có dữ liệu môn học.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((s: any) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary)]">{s.code}</TableCell>
                    <TableCell className="font-medium text-[rgb(var(--text-primary)]">{s.name}</TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary)]">{s.credits}</TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary)]">{(s.semesterOffered || []).join(', ')}</TableCell>
                    <TableCell>
                      <Badge variant={TYPE_COLORS[s.type] ?? 'neutral'} size="sm">{s.type}</Badge>
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary)]">{s.departmentName || s.department || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
