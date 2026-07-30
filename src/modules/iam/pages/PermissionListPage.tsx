import { useMemo, useState } from 'react';
import { Download, Search, Loader2, Layers } from 'lucide-react';
import {
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  toast,
} from '@/components/ui';
import { useIamPermissions } from '@/hooks/useIam';
import type { Permission } from '@/types/iam.types';

const MODULE_LABELS: Record<string, string> = {
  users: 'Người dùng',
  roles: 'Phân quyền',
  system: 'Hệ thống',
  academic_years: 'Năm học',
  buildings: 'Tòa nhà',
  campuses: 'Cơ sở',
  countries: 'Quốc gia',
  departments: 'Bộ môn',
  districts: 'Quận/Huyện',
  divisions: 'Phòng ban',
  faculties: 'Khoa',
  floors: 'Tầng',
  master_groups: 'Nhóm danh mục',
  master_values: 'Giá trị danh mục',
  organizations: 'Tổ chức',
  provinces: 'Tỉnh/Thành',
  rooms: 'Phòng',
  room_types: 'Loại phòng',
  semesters: 'Học kỳ (DM)',
  wards: 'Phường/Xã',
  academic_terms: 'Học kỳ',
  academic_warnings: 'Cảnh báo HV',
  admission_batches: 'Đợt TS',
  admission_students: 'SV trúng tuyển',
  class_schedules: 'TKB',
  classes: 'Lớp học',
  courses: 'Học phần',
  course_registrations: 'ĐKHP',
  course_sections: 'Lớp HP',
  curriculums: 'CTĐT',
  curriculum_subjects: 'MH trong CTĐT',
  gpa_histories: 'LS GPA',
  graduation_batches: 'Đợt TN',
  graduation_candidates: 'DS xét TN',
  graduations: 'Tốt nghiệp',
  majors: 'Ngành học',
  schedule_changes: 'Đổi lịch học',
  specializations: 'Chuyên ngành',
  student_class_changes: 'SV chuyển lớp',
  students: 'Sinh viên',
  student_dropouts: 'SV thôi học',
  student_grades: 'Điểm SV',
  student_logs: 'Nhật ký SV',
  student_major_changes: 'SV chuyển ngành',
  student_profiles: 'Hồ sơ SV',
  student_reservations: 'SV bảo lưu',
  student_status_histories: 'LS trạng thái SV',
  subject_conditions: 'ĐK môn học',
  subjects: 'Môn học',
  subject_prerequisites: 'Môn tiên quyết',
  subject_types: 'Loại môn học',
  training_systems: 'Hệ đào tạo',
};

function labelFor(module: string): string {
  return MODULE_LABELS[module] ?? module;
}

export function PermissionTabContent() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const query = useIamPermissions();

  const grouped: Record<string, Permission[]> = useMemo(() => {
    return query.data?.data ?? {};
  }, [query.data]);

  const modules = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const filteredGrouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result: Record<string, Permission[]> = {};
    for (const [mod, perms] of Object.entries(grouped)) {
      if (moduleFilter && mod !== moduleFilter) continue;
      const filtered = q
        ? perms.filter(p =>
            p.code.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q) ||
            (p.description ?? '').toLowerCase().includes(q)
          )
        : perms;
      if (filtered.length) result[mod] = filtered;
    }
    return result;
  }, [grouped, moduleFilter, search]);

  const totalPerms = useMemo(
    () => Object.values(filteredGrouped).reduce((s, arr) => s + arr.length, 0),
    [filteredGrouped]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              type="search"
              placeholder="Tìm tên, mã quyền..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
            />
          </div>
          <select
            title="Lọc theo module"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
          >
            <option value="">Tất cả module</option>
            {modules.map(m => <option key={m} value={m}>{labelFor(m)}</option>)}
          </select>
          <p className="text-xs text-[rgb(var(--text-muted))]">
            {totalPerms.toLocaleString('vi-VN')} quyền · {Object.keys(filteredGrouped).length} module
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={() => {
            const flat = Object.entries(filteredGrouped).flatMap(([mod, perms]) =>
              perms.map(p => ({ module: mod, ...p }))
            );
            if (!flat.length) { toast.warning('Không có dữ liệu để xuất.'); return; }
            const headers = ['Module', 'Mã quyền', 'Tên quyền', 'Mô tả'];
            const rows = flat.map(p => [p.module, p.code, p.name, p.description ?? '']);
            const csv = [headers, ...rows].map(r => r.map(c => `"${String(c)}"`).join(',')).join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `danh-sach-quyen-${Date.now()}.csv`;
            a.click(); URL.revokeObjectURL(url);
            toast.success(`Đã xuất ${flat.length} quyền.`);
          }}
        >
          Xuất danh sách
        </Button>
      </div>

      {query.isLoading && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] py-8 text-center text-[rgb(var(--text-muted))] text-sm">
          <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
          Đang tải danh sách quyền...
        </div>
      )}

      {query.isError && (
        <div className="rounded-xl border border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.05)] py-8 text-center text-[rgb(var(--error))] text-sm">
          {(query.error as Error).message || 'Không thể tải dữ liệu.'}
        </div>
      )}

      {!query.isLoading && !query.isError && Object.keys(filteredGrouped).length === 0 && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] py-8 text-center text-[rgb(var(--text-muted))] text-sm">
          Không tìm thấy quyền nào phù hợp.
        </div>
      )}

      {!query.isLoading && !query.isError && Object.entries(filteredGrouped).map(([mod, perms]) => (
        <div key={mod} className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--bg-base))] border-b border-[rgb(var(--border))]">
            <Layers className="h-4 w-4 text-[rgb(var(--primary))]" />
            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
              {labelFor(mod)}
            </h3>
            <code className="text-xs text-[rgb(var(--text-muted))]">({mod})</code>
            <Badge variant="neutral" size="sm">{perms.length} quyền</Badge>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-64">Mã quyền</TableHeadCell>
                <TableHeadCell>Tên quyền</TableHeadCell>
                <TableHeadCell>Mô tả</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {perms.map(p => (
                <TableRow key={p.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <TableCell>
                    <code className="text-xs font-mono bg-[rgb(var(--bg-base))] px-1.5 py-0.5 rounded">
                      {p.code}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{p.name}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] text-sm max-w-xs truncate">
                    {p.description || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

export default PermissionTabContent;