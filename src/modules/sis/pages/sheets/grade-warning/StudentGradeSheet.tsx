import { useState, useMemo } from 'react';
import { Eye, Edit, RotateCcw, Lock, Unlock, Save } from 'lucide-react';
import {
  Button,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useHqnhatStudentGrades,
  useHqnhatStudentGrade,
  useBulkUpdateHqnhatStudentGrades,
  useUpdateHqnhatStudentGrade,
  useHqnhatCourseSections,
  useHqnhatStudents,
  useHqnhatCourseRegistrations,
} from '@/hooks/useHqnhat';
import type {
  HqnhatStudentGrade,
  HqnhatCourseSection,
  HqnhatStudent,
  HqnhatCourseRegistration,
  HqnhatStudentGradeUpdatePayload,
} from '@/types/hqnhat.types';

function formatScore(val: unknown): string {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return num.toFixed(1);
}

interface EditableRow {
  id: number;
  attendance_score: number | null;
  assignment_score: number | null;
  midterm_score: number | null;
  final_score: number | null;
  total_score: number | null;
}

interface EnrichedGrade extends HqnhatStudentGrade {
  _student?: HqnhatStudent;
  _section?: HqnhatCourseSection;
  _registration?: HqnhatCourseRegistration;
}

export function StudentGradeSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [sectionFilter, setSectionFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [lockedFilter, setLockedFilter] = useState('');

  // API params - CHỈ dùng những gì API hỗ trợ
  const apiParams: Record<string, unknown> = {
    page,
    per_page: pageSize,
  };
  
  if (sectionFilter) {
    apiParams.course_section_id = Number(sectionFilter);
  }
  if (lockedFilter !== '') {
    apiParams.is_locked = lockedFilter === '1';
  }

  // Fetch data
  const { data, isLoading, isFetching, refetch } = useHqnhatStudentGrades(apiParams);
  const { data: sectionsData } = useHqnhatCourseSections({ per_page: 100 });
  // Fetch tất cả students để join
  const { data: studentsData, isLoading: studentsLoading } = useHqnhatStudents({ per_page: 100 });
  const { data: regsData, isLoading: regsLoading } = useHqnhatCourseRegistrations({ per_page: 100 });

  // Safely extract arrays
  const sections = (sectionsData?.data as HqnhatCourseSection[] | undefined) ?? [];
  const allStudents = (studentsData?.data as HqnhatStudent[] | undefined) ?? [];
  const allRegistrations = (regsData?.data as HqnhatCourseRegistration[] | undefined) ?? [];

  // Enrich grades
  const enrichedItems = useMemo((): EnrichedGrade[] => {
    const grades = (data?.data as HqnhatStudentGrade[] | undefined) ?? [];
    
    return grades.map(grade => {
      const registration = allRegistrations.find(r => r.id === grade.course_registration_id);
      const student = registration 
        ? allStudents.find(s => s.id === registration.student_id)
        : undefined;
      const section = registration
        ? sections.find(sec => sec.id === registration.course_section_id)
        : undefined;
      
      return {
        ...grade,
        _student: student,
        _section: section,
        _registration: registration,
      };
    });
  }, [data?.data, allRegistrations, allStudents, sections]);

  // Filter items - client-side filter vì API không hỗ trợ student_id
  const filteredItems = useMemo(() => {
    if (!studentFilter) return enrichedItems;
    const filterId = Number(studentFilter);
    return enrichedItems.filter(item => item._student?.id === filterId);
  }, [enrichedItems, studentFilter]);

  const total = data?.meta?.total ?? filteredItems.length;
  const items = filteredItems;

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [editedRows, setEditedRows] = useState<Record<number, EditableRow>>({});
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockingGrade, setLockingGrade] = useState<EnrichedGrade | null>(null);

  const { data: detailData, isLoading: detailLoading } = useHqnhatStudentGrade(detailId ?? undefined);
  const bulkMut = useBulkUpdateHqnhatStudentGrades();
  const updateMut = useUpdateHqnhatStudentGrade();

  const getStudentName = (item: EnrichedGrade): string => {
    if (item._student) {
      return `${item._student.student_code} — ${item._student.full_name}`;
    }
    return `SV #${item._registration?.student_id ?? item.course_registration_id}`;
  };

  const getSectionCode = (item: EnrichedGrade): string => {
    if (item._section) {
      return item._section.section_code;
    }
    return `LHP #${item._registration?.course_section_id ?? 0}`;
  };

  const openDetail = (item: EnrichedGrade) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openLockModal = (item: EnrichedGrade) => {
    setLockingGrade(item);
    setLockModalOpen(true);
  };

  const handleLockToggle = async () => {
    if (!lockingGrade) return;
    const payload: HqnhatStudentGradeUpdatePayload = {
      is_locked: !lockingGrade.is_locked,
    };
    try {
      await updateMut.mutateAsync({ id: lockingGrade.id, payload });
      setLockModalOpen(false);
      setLockingGrade(null);
      refetch();
    } catch { /* silent */ }
  };

  const enterBulkMode = () => {
    const initial: Record<number, EditableRow> = {};
    items.forEach((item) => {
      initial[item.id] = {
        id: item.id,
        attendance_score: item.attendance_score,
        assignment_score: item.assignment_score,
        midterm_score: item.midterm_score,
        final_score: item.final_score,
        // total_score do backend tự tính, không cần truyền
      };
    });
    setEditedRows(initial);
    setBulkMode(true);
  };

  const handleBulkChange = (id: number, field: keyof Omit<EditableRow, 'id'>, value: string) => {
    const num = value === '' ? null : parseFloat(value);
    setEditedRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: isNaN(num as number) ? null : num },
    }));
  };

  const handleBulkSave = async () => {
    const grades = Object.values(editedRows).map((r) => ({
      id: r.id,
      attendance_score: r.attendance_score ?? undefined,
      assignment_score: r.assignment_score ?? undefined,
      midterm_score: r.midterm_score ?? undefined,
      final_score: r.final_score ?? undefined,
      // total_score do backend tự tính, không gửi lên
    }));
    try {
      await bulkMut.mutateAsync({ grades });
      setBulkMode(false);
      setEditedRows({});
      refetch();
    } catch { /* silent */ }
  };

  const cancelBulkMode = () => {
    setBulkMode(false);
    setEditedRows({});
  };

  const resetFilters = () => {
    setSectionFilter('');
    setStudentFilter('');
    setLockedFilter('');
    setPage(1);
  };

  const getLetterGradeLabel = (grade: string | null | undefined): string => {
    if (!grade) return '—';
    const map: Record<string, string> = {
      'A+': 'A+', 'A': 'A', 'B+': 'B+', 'B': 'B',
      'C+': 'C+', 'C': 'C', 'D+': 'D+', 'D': 'D', 'F': 'F',
    };
    return map[grade] ?? grade;
  };

  const hasFilters = sectionFilter || studentFilter || lockedFilter;
  const isLoadingAny = regsLoading || studentsLoading;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Student filter - client-side filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Sinh viên</label>
          <select
            value={studentFilter}
            onChange={(e) => { setStudentFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả SV</option>
            {allStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.student_code} — {s.full_name}</option>
            ))}
          </select>
        </div>

        {/* Section filter - API filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Lớp học phần</label>
          <select
            value={sectionFilter}
            onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả LHP</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.section_code}</option>
            ))}
          </select>
        </div>

        {/* Lock filter - API filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái khóa</label>
          <select
            value={lockedFilter}
            onChange={(e) => { setLockedFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="0">Mở khóa</option>
            <option value="1">Đã khóa</option>
          </select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}

        {bulkMode ? (
          <>
            <Button variant="outline" onClick={cancelBulkMode}>Hủy</Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleBulkSave} loading={bulkMut.isPending}>
              Lưu {Object.keys(editedRows).length} dòng
            </Button>
          </>
        ) : (
          <Button className="ml-auto" leftIcon={<Edit className="h-4 w-4" />} onClick={enterBulkMode} disabled={items.length === 0}>
            Nhập điểm
          </Button>
        )}
      </div>

      {isLoadingAny && (
        <div className="text-xs text-[rgb(var(--text-muted))]">Đang tải thông tin...</div>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            {bulkMode ? (
              <>
                <TableHeadCell>Sinh viên</TableHeadCell>
                <TableHeadCell>CC</TableHeadCell>
                <TableHeadCell>BT</TableHeadCell>
                <TableHeadCell>GK</TableHeadCell>
                <TableHeadCell>CK</TableHeadCell>
                <TableHeadCell>Tổng</TableHeadCell>
              </>
            ) : (
              <>
                <TableHeadCell>Sinh viên</TableHeadCell>
                <TableHeadCell>LHP</TableHeadCell>
                <TableHeadCell>CC</TableHeadCell>
                <TableHeadCell>BT</TableHeadCell>
                <TableHeadCell>GK</TableHeadCell>
                <TableHeadCell>CK</TableHeadCell>
                <TableHeadCell>Tổng</TableHeadCell>
                <TableHeadCell>Xếp loại</TableHeadCell>
                <TableHeadCell>Đạt</TableHeadCell>
                <TableHeadCell>Khóa</TableHeadCell>
                <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={11} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có điểm nào
              </TableCell>
            </TableRow>
          ) : bulkMode ? (
            items.map((item, i) => {
              const edit = editedRows[item.id];
              return (
                <TableRow key={item.id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">
                    {getStudentName(item)}
                  </TableCell>
                  {(['attendance_score', 'assignment_score', 'midterm_score', 'final_score'] as const).map((field) => (
                    <TableCell key={field}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={edit[field] ?? ''}
                        onChange={(e) => handleBulkChange(item.id, field, e.target.value)}
                        className="h-8 w-20 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-2 text-sm text-center"
                        disabled={item.is_locked}
                      />
                    </TableCell>
                  ))}
                  {/* Tổng: backend tự tính, chỉ hiển thị từ item gốc */}
                  <TableCell>
                    <span className="h-8 flex items-center justify-center w-20 text-sm font-bold text-[rgb(var(--accent))] tabular-nums">
                      {formatScore(item.total_score)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(page - 1) * pageSize + i + 1}
                </TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">
                  {getStudentName(item)}
                </TableCell>
                <TableCell className="text-xs font-mono text-[rgb(var(--text-secondary))]">
                  {getSectionCode(item)}
                </TableCell>
                <TableCell className="tabular-nums text-center">{formatScore(item.attendance_score)}</TableCell>
                <TableCell className="tabular-nums text-center">{formatScore(item.assignment_score)}</TableCell>
                <TableCell className="tabular-nums text-center">{formatScore(item.midterm_score)}</TableCell>
                <TableCell className="tabular-nums text-center">{formatScore(item.final_score)}</TableCell>
                <TableCell className="tabular-nums text-center font-bold text-[rgb(var(--accent))]">
                  {formatScore(item.total_score)}
                </TableCell>
                <TableCell className="text-center">
                  {item.letter_grade ? (
                    <Badge variant="info" size="sm">{getLetterGradeLabel(item.letter_grade)}</Badge>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  {item.is_pass !== null ? (
                    <Badge variant={item.is_pass ? 'success' : 'error'} size="sm" dot>
                      {item.is_pass ? 'Đạt' : 'Không đạt'}
                    </Badge>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={item.is_locked ? 'warning' : 'success'} size="sm" dot>
                    {item.is_locked ? 'Đã khóa' : 'Mở khóa'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openLockModal(item)} title={item.is_locked ? 'Mở khóa' : 'Khóa'}>
                      {item.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!bulkMode && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết điểm" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--primary))] border-t-transparent" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">ID Đăng ký HP</p>
                <p className="text-base font-semibold font-mono">#{detailData.data.course_registration_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái khóa</p>
                <Badge variant={detailData.data.is_locked ? 'warning' : 'success'} size="sm" dot>
                  {detailData.data.is_locked ? 'Đã khóa' : 'Mở khóa'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm chuyên cần</p>
                <p className="text-base font-semibold tabular-nums">{formatScore(detailData.data.attendance_score)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm bài tập</p>
                <p className="text-base font-semibold tabular-nums">{formatScore(detailData.data.assignment_score)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm giữa kỳ</p>
                <p className="text-base font-semibold tabular-nums">{formatScore(detailData.data.midterm_score)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm cuối kỳ</p>
                <p className="text-base font-semibold tabular-nums">{formatScore(detailData.data.final_score)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm tổng</p>
                <p className="text-base font-bold tabular-nums text-[rgb(var(--accent))]">{formatScore(detailData.data.total_score)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Xếp loại</p>
                <p className="text-base font-semibold">{detailData.data.letter_grade ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm 4</p>
                <p className="text-base font-semibold tabular-nums">
                  {typeof detailData.data.grade_point === 'number' ? detailData.data.grade_point.toFixed(2) : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Kết quả</p>
                <p className="text-base font-semibold">
                  {detailData.data.is_pass === null ? '—' : detailData.data.is_pass ? 'Đạt' : 'Không đạt'}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>
        )}
      </Modal>

      {/* Lock Modal */}
      <Modal open={lockModalOpen} onClose={() => { setLockModalOpen(false); setLockingGrade(null); }} title={lockingGrade?.is_locked ? 'Mở khóa điểm' : 'Khóa điểm'} size="sm">
        {lockingGrade && (
          <div className="space-y-4">
            <p className="text-sm">
              Bạn có chắc muốn {lockingGrade.is_locked ? 'mở khóa' : 'khóa'} điểm của{' '}
              <span className="font-semibold">{getStudentName(lockingGrade)}</span> không?
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setLockModalOpen(false); setLockingGrade(null); }}>Hủy</Button>
              <Button onClick={handleLockToggle} loading={updateMut.isPending}>
                {lockingGrade.is_locked ? 'Mở khóa' : 'Khóa'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
