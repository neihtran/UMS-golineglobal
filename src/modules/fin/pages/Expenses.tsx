import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import { Card, CardContent, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const EXPENSES = [
  { id: 'e1', description: 'Mua sắm thiết bị văn phòng Q2', category: 'Mua sắm', amount: 45000000, date: '25/06/2026', status: 'pending', paidTo: 'Công ty TNHH Thiết bị A', dept: 'Phòng Hành chính' },
  { id: 'e2', description: 'Chi phí điện nước tháng 6/2026', category: 'Điện nước', amount: 28000000, date: '24/06/2026', status: 'approved', paidTo: 'Công ty Điện lực', dept: 'Phòng Hành chính' },
  { id: 'e3', description: 'In ấn tài liệu tuyển sinh 2026', category: 'In ấn', amount: 15000000, date: '23/06/2026', status: 'approved', paidTo: 'Công ty In Bình Minh', dept: 'Phòng Tuyển sinh' },
  { id: 'e4', description: 'Nâng cấp hệ thống mạng LAN', category: 'CNTT', amount: 120000000, date: '22/06/2026', status: 'pending', paidTo: 'Công ty Network VN', dept: 'Phòng KH-CN' },
  { id: 'e5', description: 'Sửa chữa cơ sở vật chất phòng A301', category: 'Sửa chữa', amount: 85000000, date: '20/06/2026', status: 'rejected', paidTo: 'Công ty Xây dựng B', dept: 'Phòng Hành chính' },
];

const CATEGORIES = ['Tất cả', 'Mua sắm', 'Điện nước', 'In ấn', 'CNTT', 'Sửa chữa'];
const STATUS_CONFIG: Record<string, { variant: 'success' | 'error' | 'warning' | 'info' | 'neutral'; label: string }> = {
  approved: { variant: 'success', label: 'Đã duyệt' },
  pending: { variant: 'warning', label: 'Chờ duyệt' },
  rejected: { variant: 'error', label: 'Từ chối' },
};

function formatVND(v: number) {
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)} triệu`;
  return `${v.toLocaleString('vi-VN')}đ`;
}

export default function Expenses() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Tất cả');
  const [status] = useState('Tất cả');

  const filtered = EXPENSES.filter((e) => {
    const matchCat = category === 'Tất cả' || e.category === category;
    const matchStatus = status === 'Tất cả' || e.status === status;
    return matchCat && matchStatus;
  });

  const totalAmount = filtered.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chi tiêu & Quỹ"
        description="FIN-01 — Quản lý chi tiêu, ngân sách và quỹ của trường"
        breadcrumbs={[
          { label: 'FIN', href: '/fin' },
          { label: 'Chi tiêu & Quỹ' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất Excel</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Tạo phiếu chi</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-[rgb(var(--error)/0.05)] border-[rgb(var(--error)/0.2)]">
          <CardContent className="p-5 text-center">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Chi tiêu Q2/2026</p>
            <p className="text-3xl font-black text-[rgb(var(--error))] mt-2">₫293.5M</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgb(var(--warning)/0.05)] border-[rgb(var(--warning)/0.2)]">
          <CardContent className="p-5 text-center">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Chờ duyệt</p>
            <p className="text-3xl font-black text-[rgb(var(--warning))] mt-2">₫165M</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgb(var(--success)/0.05)] border-[rgb(var(--success)/0.2)]">
          <CardContent className="p-5 text-center">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Đã duyệt Q2</p>
            <p className="text-3xl font-black text-[rgb(var(--success))] mt-2">₫128.5M</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-center gap-3">
          <span className="text-sm text-[rgb(var(--text-muted))]">Lọc:</span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-[rgb(var(--primary))] text-white'
                  : 'bg-[rgb(var(--bg-base))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]'
              }`}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto text-sm font-semibold text-[rgb(var(--text-primary))]">
            Tổng: {formatVND(totalAmount)}
          </span>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Mô tả</TableHeadCell>
              <TableHeadCell>Danh mục</TableHeadCell>
              <TableHeadCell>Đơn vị yêu cầu</TableHeadCell>
              <TableHeadCell>Đối tượng thanh toán</TableHeadCell>
              <TableHeadCell>Ngày</TableHeadCell>
              <TableHeadCell>Số tiền</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
              <TableHeadCell>Thao tác</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((e) => {
              const sc = STATUS_CONFIG[e.status];
              return (
                <TableRow key={e.id}>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))] max-w-xs truncate">{e.description}</TableCell>
                  <TableCell><Badge variant="neutral" size="sm">{e.category}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{e.dept}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{e.paidTo}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] text-xs">{e.date}</TableCell>
                  <TableCell className="font-semibold text-[rgb(var(--error))]">{formatVND(e.amount)}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {e.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" className="text-[rgb(var(--success))]">Duyệt</Button>
                          <Button variant="ghost" size="sm" className="text-[rgb(var(--error))]">Từ chối</Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/fin/chi-tieu/${e.id}`)}>Chi tiết</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
