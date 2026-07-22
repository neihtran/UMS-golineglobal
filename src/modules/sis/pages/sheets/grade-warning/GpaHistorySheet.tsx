import { useState } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import {
  Button,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useHqnhatGpaHistories,
  useHqnhatGpaHistory,
  useHqnhatStudents,
  useHqnhatAcademicTerms,
} from '@/hooks/useHqnhat';
import type {
  HqnhatGpaHistory,
  HqnhatStudent,
  HqnhatAcademicTerm,
} from '@/types/hqnhat.types';

const ACADEMIC_RANK: Record<number, { label: string; variant: 'success' | 'info' | 'warning' | 'error' | 'neutral' }> = {
  1: { label: 'Xuất sắc', variant: 'success' },
  2: { label: 'Giỏi', variant: 'info' },
  3: { label: 'Khá', variant: 'success' },
  4: { label: 'Trung bình', variant: 'warning' },
  5: { label: 'Yếu', variant: 'error' },
  6: { label: 'Kém', variant: 'error' },
};

export function GpaHistorySheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [termFilter, setTermFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [rankFilter, setRankFilter] = useState('');

  // API params - đơn giản chỉ dùng những gì cần thiết
  const apiParams: Record<string, unknown> = {
    page,
    per_page: pageSize,
  };
  if (termFilter) apiParams.academic_term_id = Number(termFilter);
  if (studentFilter) apiParams.student_id = Number(studentFilter);
  if (rankFilter) apiParams.academic_rank = Number(rankFilter);

  const { data, isLoading, isFetching, refetch } = useHqnhatGpaHistories(apiParams);
  
  // Fetch tất cả students để hiển thị tên
  const { data: allStudentsData, isLoading: allStudentsLoading } = useHqnhatStudents({ per_page: 100 });
  const { data: termsData } = useHqnhatAcademicTerms({ per_page: 100 });

  const allStudents = (allStudentsData?.data as HqnhatStudent[] | undefined) ?? [];
  const terms = (termsData?.data as HqnhatAcademicTerm[] | undefined) ?? [];

  const items = (data?.data as HqnhatGpaHistory[] | undefined) ?? [];
  const total = data?.meta?.total ?? items.length;

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: detailData, isLoading: detailLoading } = useHqnhatGpaHistory(detailId ?? undefined);

  const getStudentName = (id: number): string => {
    const s = allStudents.find(x => x.id === id);
    return s ? `${s.student_code} — ${s.full_name}` : `SV #${id}`;
  };

  const getTermName = (id: number): string => {
    const t = terms.find(x => x.id === id);
    return t ? t.code ?? `HK #${id}` : `HK #${id}`;
  };

  const openDetail = (item: HqnhatGpaHistory) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const resetFilters = () => {
    setTermFilter('');
    setStudentFilter('');
    setRankFilter('');
    setPage(1);
  };

  const formatGpa = (val: unknown): string => {
    if (val === null || val === undefined) return '—';
    const num = Number(val);
    if (isNaN(num)) return '—';
    return num.toFixed(2);
  };

  const hasFilters = termFilter || studentFilter || rankFilter;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Student filter */}
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

        {/* Term filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Học kỳ</label>
          <select
            value={termFilter}
            onChange={(e) => { setTermFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả HK</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>{t.code}</option>
            ))}
          </select>
        </div>

        {/* Rank filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Xếp loại</label>
          <select
            value={rankFilter}
            onChange={(e) => { setRankFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="1">Xuất sắc</option>
            <option value="2">Giỏi</option>
            <option value="3">Khá</option>
            <option value="4">Trung bình</option>
            <option value="5">Yếu</option>
            <option value="6">Kém</option>
          </select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
      </div>

      {allStudentsLoading && (
        <div className="text-xs text-[rgb(var(--text-muted))]">Đang tải thông tin sinh viên...</div>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Sinh viên</TableHeadCell>
            <TableHeadCell>Học kỳ</TableHeadCell>
            <TableHeadCell className="text-center">Điểm TK (4)</TableHeadCell>
            <TableHeadCell className="text-center">Điểm HK (10)</TableHeadCell>
            <TableHeadCell className="text-center">TC đăng ký</TableHeadCell>
            <TableHeadCell className="text-center">TC tích lũy</TableHeadCell>
            <TableHeadCell className="text-center">Xếp loại</TableHeadCell>
            <TableHeadCell className="text-right w-20">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={9} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có lịch sử GPA nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const rank = ACADEMIC_RANK[item.academic_rank] ?? { label: '—', variant: 'neutral' as const };
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{getStudentName(item.student_id)}</TableCell>
                  <TableCell>{getTermName(item.academic_term_id)}</TableCell>
                  <TableCell className="tabular-nums text-center font-semibold text-[rgb(var(--accent))]">
                    {formatGpa(item.cumulative_gpa)}
                  </TableCell>
                  <TableCell className="tabular-nums text-center font-semibold">
                    {formatGpa(item.semester_gpa)}
                  </TableCell>
                  <TableCell className="tabular-nums text-center">{item.registered_credit}</TableCell>
                  <TableCell className="tabular-nums text-center">{item.accumulated_credit}</TableCell>
                  <TableCell>
                    <Badge variant={rank.variant} size="sm" dot>{rank.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết lịch sử GPA" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--primary))] border-t-transparent" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Sinh viên</p>
                <p className="text-base font-semibold">{getStudentName(detailData.data.student_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Học kỳ</p>
                <p className="text-base font-semibold">{getTermName(detailData.data.academic_term_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm TK (thang 4)</p>
                <p className="text-base font-bold tabular-nums text-[rgb(var(--accent))]">{formatGpa(detailData.data.cumulative_gpa)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm HK (thang 10)</p>
                <p className="text-base font-bold tabular-nums">{formatGpa(detailData.data.semester_gpa)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Số TC đăng ký</p>
                <p className="text-base font-semibold tabular-nums">{detailData.data.registered_credit}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Số TC tích lũy</p>
                <p className="text-base font-semibold tabular-nums">{detailData.data.accumulated_credit}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Số TC đạt</p>
                <p className="text-base font-semibold tabular-nums">{detailData.data.earned_credit}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Xếp loại</p>
                <p className="text-base font-semibold">
                  {ACADEMIC_RANK[detailData.data.academic_rank]?.label ?? '—'}
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
    </div>
  );
}
