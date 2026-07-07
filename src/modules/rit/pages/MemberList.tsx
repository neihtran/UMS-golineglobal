import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, FlaskConical, Users,
  Award, CheckCircle2, FileText,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import MemberDetailPage from './MemberDetailPage';

const MEMBERS = [
  { id: 'm01', name: 'PGS.TS. Lý Văn Hùng', code: 'NCV-2015-001', degree: 'Tiến sĩ', field: 'Khoa học máy tính', dept: 'Khoa CNTT', projects: 12, publications: 45, hIndex: 8, status: 'active', type: 'capped', since: 2015 },
  { id: 'm02', name: 'TS. Thảo Nguyễn', code: 'NCV-2018-012', degree: 'Tiến sĩ', field: 'Trí tuệ nhân tạo', dept: 'Khoa CNTT', projects: 8, publications: 28, hIndex: 5, status: 'active', type: 'internal', since: 2018 },
  { id: 'm03', name: 'TS. Bùi Đình Nam', code: 'NCV-2020-023', degree: 'Thạc sĩ', field: 'Kinh tế số', dept: 'Khoa Kinh tế', projects: 5, publications: 12, hIndex: 3, status: 'active', type: 'internal', since: 2020 },
  { id: 'm04', name: 'PGS.TS. Hoàng Thị Lan', code: 'NCV-2012-003', degree: 'Phó Giáo sư', field: 'Quản trị kinh doanh', dept: 'Khoa Kinh tế', projects: 15, publications: 67, hIndex: 11, status: 'active', type: 'capped', since: 2012 },
  { id: 'm05', name: 'GS.TS. Nguyễn Hoàng Long', code: 'NCV-2010-001', degree: 'Giáo sư', field: 'An toàn thông tin', dept: 'Khoa CNTT', projects: 20, publications: 98, hIndex: 15, status: 'active', type: 'capped', since: 2010 },
  { id: 'm06', name: 'TS. Trần Thị Mai Lan', code: 'NCV-2022-034', degree: 'Tiến sĩ', field: 'Khoa học dữ liệu', dept: 'Khoa CNTT', projects: 3, publications: 8, hIndex: 2, status: 'active', type: 'internal', since: 2022 },
  { id: 'm07', name: 'ThS. Lê Văn Minh', code: 'NCV-2021-028', degree: 'Thạc sĩ', field: 'Marketing số', dept: 'Khoa Kinh tế', projects: 4, publications: 6, hIndex: 1, status: 'active', type: 'internal', since: 2021 },
  { id: 'm08', name: 'GS.TS. Phạm Thu Hà', code: 'NCV-2008-002', degree: 'Giáo sư', field: 'Ngôn ngữ học', dept: 'Khoa Ngoại ngữ', projects: 18, publications: 85, hIndex: 13, status: 'active', type: 'capped', since: 2008 },
  { id: 'm09', name: 'TS. Ngô Thanh Sơn', code: 'NCV-2023-041', degree: 'Tiến sĩ', field: 'Giáo dục số', dept: 'Khoa Sư phạm', projects: 2, publications: 5, hIndex: 1, status: 'pending', type: 'internal', since: 2023 },
  { id: 'm10', name: 'PGS.TS. Đặng Thu Hà', code: 'NCV-2016-007', degree: 'Phó Giáo sư', field: 'Y sinh', dept: 'Khoa Y dược', projects: 9, publications: 41, hIndex: 7, status: 'active', type: 'capped', since: 2016 },
];

const TYPE_CONFIG: Record<string, { variant: 'primary' | 'accent'; label: string }> = {
  capped: { variant: 'primary', label: 'Nghiên cứu viên chính' },
  internal: { variant: 'accent', label: 'Nghiên cứu viên' },
};

const DEGREE_ORDER: Record<string, number> = { 'Giáo sư': 0, 'Phó Giáo sư': 1, 'Tiến sĩ': 2, 'Thạc sĩ': 3 };

export default function MemberList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('Tất cả');
  const [type, setType] = useState('all');

  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedMember = selectedId ? MEMBERS.find((m) => m.id === selectedId) : null;

  const filtered = MEMBERS
    .filter((m) => {
      const match = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()) || m.field.toLowerCase().includes(search.toLowerCase());
      const matchDept = dept === 'Tất cả' || m.dept === dept;
      const matchType = type === 'all' || m.type === type;
      return match && matchDept && matchType;
    })
    .sort((a, b) => (DEGREE_ORDER[a.degree] ?? 9) - (DEGREE_ORDER[b.degree] ?? 9));

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Danh sách Nghiên cứu viên"
        description="RIT-01 — Quản lý hồ sơ nghiên cứu viên, chuyên gia và cộng tác viên"
        breadcrumbs={[{ label: 'RIT', href: '/rit' }, { label: 'Nghiên cứu viên' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/rit/ncv/tao')}>Thêm NCV</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng NCV', value: MEMBERS.length, icon: <Users className="h-5 w-5" />, color: 'primary' },
          { label: 'NCV chính', value: MEMBERS.filter(m => m.type === 'capped').length, icon: <FlaskConical className="h-5 w-5" />, color: 'primary' },
          { label: 'Đang hoạt động', value: MEMBERS.filter(m => m.status === 'active').length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: 'H-index TB', value: (MEMBERS.reduce((s, m) => s + m.hIndex, 0) / MEMBERS.length).toFixed(1), icon: <Award className="h-5 w-5" />, color: 'accent' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3 hover-lift">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tên, lĩnh vực..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-80"
        />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          {['Tất cả', 'Khoa CNTT', 'Khoa Kinh tế', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả loại</option>
          <option value="capped">NCV chính</option>
          <option value="internal">NCV nội bộ</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Nghiên cứu viên</TableHeadCell>
            <TableHeadCell>Mã NCV</TableHeadCell>
            <TableHeadCell>Học hàm</TableHeadCell>
            <TableHeadCell>Khoa / Đơn vị</TableHeadCell>
            <TableHeadCell>Lĩnh vực</TableHeadCell>
            <TableHeadCell className="text-center">Đề tài</TableHeadCell>
            <TableHeadCell className="text-center">Bài báo</TableHeadCell>
            <TableHeadCell className="text-center">H-index</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={11} message="Không tìm thấy nghiên cứu viên nào" />
          ) : (
            paged.map((m) => {
              const tc = TYPE_CONFIG[m.type];
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{m.name}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">Tham gia: {m.since}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{m.code}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-semibold ${m.degree === 'Giáo sư' ? 'text-[rgb(var(--primary))]' : m.degree === 'Phó Giáo sư' ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-secondary))]'}`}>
                      {m.degree}
                    </span>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{m.dept}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{m.field}</TableCell>
                  <TableCell className="text-center font-semibold text-[rgb(var(--text-primary))]">{m.projects}</TableCell>
                  <TableCell className="text-center text-[rgb(var(--text-secondary))]">{m.publications}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                      {m.hIndex}
                    </span>
                  </TableCell>
                  <TableCell><Badge variant={tc.variant} size="sm">{tc.label}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={m.status === 'active' ? 'success' : 'warning'} dot size="sm">
                      {m.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => openDetail(m.id)}>Chi tiết</Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedMember ? selectedMember.name : ''}
        description={selectedMember ? `${selectedMember.code} · ${selectedMember.degree} · ${selectedMember.dept}` : ''}
        size="fullscreen"
      >
        {selectedMember ? <MemberDetailPage id={selectedMember.id} /> : null}
      </DetailModal>
    </div>
  );
}
