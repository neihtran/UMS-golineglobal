import { useState } from 'react';
import {
  Download, Landmark, UserPlus,
  Users, Award, CheckCircle2,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const MEMBERS = [
  { id: 'mb01', name: 'Nguyễn Văn A', birthDate: '1960-05-15', gender: 'Nam', hometown: 'Hà Nội', joinDate: '2010-03-01', cell: 'Chi bộ Khoa CNTT', position: ' Bí thư', role: 'dang_vien', status: 'active', educationLevel: 'Tiến sĩ', notes: '' },
  { id: 'mb02', name: 'Trần Thị B', birthDate: '1965-08-20', gender: 'Nữ', hometown: 'Hải Phòng', joinDate: '2012-05-10', cell: 'Chi bộ Khoa Kinh tế', position: 'Phó Bí thư', role: 'dang_vien', status: 'active', educationLevel: 'Thạc sĩ', notes: '' },
  { id: 'mb03', name: 'Lê Văn C', birthDate: '1970-01-10', gender: 'Nam', hometown: 'Nam Định', joinDate: '2015-07-01', cell: 'Chi bộ Phòng Hành chính', position: 'Chi ủy viên', role: 'dang_vien', status: 'active', educationLevel: 'Thạc sĩ', notes: '' },
  { id: 'mb04', name: 'Phạm Thị D', birthDate: '1975-11-25', gender: 'Nữ', hometown: 'Thanh Hóa', joinDate: '2018-03-15', cell: 'Chi bộ Khoa Ngoại ngữ', position: 'Chi ủy viên', role: 'dang_vien', status: 'active', educationLevel: 'Đại học', notes: '' },
  { id: 'mb05', name: 'Hoàng Văn E', birthDate: '1980-04-08', gender: 'Nam', hometown: 'Nghệ An', joinDate: '2020-06-01', cell: 'Chi bộ Khoa CNTT', position: 'Đảng viên', role: 'dang_vien', status: 'active', educationLevel: 'Thạc sĩ', notes: 'Công tác tại Phòng Tổ chức' },
  { id: 'mb06', name: 'Đặng Thu H', birthDate: '1985-09-12', gender: 'Nữ', hometown: 'Hà Nội', joinDate: '2022-01-10', cell: 'Chi bộ Khoa Luật', position: 'Đảng viên', role: 'dang_vien', status: 'active', educationLevel: 'Đại học', notes: '' },
  { id: 'mb07', name: 'Bùi Minh I', birthDate: '1972-03-30', gender: 'Nam', hometown: 'Bắc Ninh', joinDate: '2016-09-01', cell: 'Chi bộ Phòng Tài chính', position: 'Chi ủy viên', role: 'dang_vien', status: 'active', educationLevel: 'Tiến sĩ', notes: '' },
  { id: 'mb08', name: 'Ngô Thị J', birthDate: '1988-07-22', gender: 'Nữ', hometown: 'Hải Dương', joinDate: '2023-03-01', cell: 'Chi bộ Khoa Y dược', position: 'Đảng viên', role: 'dang_vien', status: 'active', educationLevel: 'Thạc sĩ', notes: 'Mới kết nạp 2023' },
];

const ROLE_CONFIG: Record<string, { variant: 'primary' | 'accent' | 'neutral'; label: string }> = {
  dang_vien: { variant: 'primary', label: 'Đảng viên' },
  duong_sinh: { variant: 'accent', label: 'Đoàn viên' },
  uy_vien: { variant: 'neutral', label: 'Ủy viên' },
};

export default function PMSMemberList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [cell, setCell] = useState('Tất cả');

  const filtered = MEMBERS.filter((m) => {
    const match = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchCell = cell === 'Tất cả' || m.cell === cell;
    return match && matchCell;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const cells = [...new Set(MEMBERS.map(m => m.cell))];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Danh sách Đảng viên"
        description="PMS-01 — Quản lý hồ sơ đảng viên, chi bộ, quá trình sinh hoạt đảng"
        breadcrumbs={[{ label: 'PMS', href: '/pms' }, { label: 'Đảng viên' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<UserPlus className="h-4 w-4" />}>Kết nạp đảng viên</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng đảng viên', value: MEMBERS.length, icon: <Users className="h-5 w-5" />, color: 'primary' },
          { label: 'Số chi bộ', value: cells.length, icon: <Landmark className="h-5 w-5" />, color: 'info' },
          { label: 'Đang sinh hoạt', value: MEMBERS.filter(m => m.status === 'active').length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: 'Tỷ lệ nữ', value: Math.round(MEMBERS.filter(m => m.gender === 'Nữ').length / MEMBERS.length * 100) + '%', icon: <Award className="h-5 w-5" />, color: 'accent' },
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
        <Input placeholder="Tìm theo tên..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-72" />
        <select value={cell} onChange={(e) => { setCell(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          {['Tất cả', ...cells].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Họ và tên</TableHeadCell>
            <TableHeadCell>Ngày sinh</TableHeadCell>
            <TableHeadCell>Giới</TableHeadCell>
            <TableHeadCell>Quê quán</TableHeadCell>
            <TableHeadCell>Ngày vào Đảng</TableHeadCell>
            <TableHeadCell>Chi bộ</TableHeadCell>
            <TableHeadCell>Chức vụ</TableHeadCell>
            <TableHeadCell>Trình độ</TableHeadCell>
            <TableHeadCell>Ghi chú</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message="Không tìm thấy đảng viên nào" />
          ) : (
            paged.map((m) => {
              const rc = ROLE_CONFIG[m.role] || ROLE_CONFIG.dang_vien;
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {m.name.split(' ').map(n => n[0]).slice(-2).join('')}
                      </div>
                      <span className="font-medium text-[rgb(var(--text-primary))]">{m.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{m.birthDate}</TableCell>
                  <TableCell><Badge variant={m.gender === 'Nam' ? 'info' : 'accent'} size="sm">{m.gender}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{m.hometown}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{m.joinDate}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{m.cell}</TableCell>
                  <TableCell>
                    <Badge variant={rc.variant} size="sm">{rc.label}</Badge>
                    {m.position && <p className="text-xs text-[rgb(var(--text-muted))]">{m.position}</p>}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{m.educationLevel}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-[rgb(var(--text-muted))]">{m.notes}</TableCell>
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
    </div>
  );
}
