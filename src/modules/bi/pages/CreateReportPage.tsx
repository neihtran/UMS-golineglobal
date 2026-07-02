import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, BarChart3, TrendingUp, PieChart,
  Database, CheckCircle2, BarChart2, TableProperties,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const CHART_TYPES = [
  { id: 'bar', icon: <BarChart3 className="h-6 w-6" />, label: 'Biểu đồ cột', desc: 'So sánh giá trị giữa các nhóm dữ liệu' },
  { id: 'line', icon: <TrendingUp className="h-6 w-6" />, label: 'Biểu đồ đường', desc: 'Hiển thị xu hướng thay đổi theo thời gian' },
  { id: 'pie', icon: <PieChart className="h-6 w-6" />, label: 'Biểu đồ tròn', desc: 'Biểu diễn tỷ lệ phần trăm của các thành phần' },
  { id: 'table', icon: <TableProperties className="h-6 w-6" />, label: 'Bảng số liệu', desc: 'Trình bày dữ liệu chi tiết dạng bảng' },
];

const CATEGORIES = ['Tuyển sinh', 'Học vụ', 'Đào tạo', 'Tài chính', 'Cơ sở', 'NCKH', 'Khác'];
const DATASOURCES = [
  { id: 'sis', label: 'SIS - Đào tạo & Sinh viên' },
  { id: 'hrm', label: 'HRM - Nhân sự' },
  { id: 'fin', label: 'FIN - Tài chính' },
  { id: 'dms', label: 'DMS - Văn bản điện tử' },
  { id: 'rit', label: 'RIT - NCKH & HTQT' },
  { id: 'lms', label: 'LMS - Dạy học số' },
];
const FIELDS = [
  { value: 'sinh_vien', label: 'Sinh viên' },
  { value: 'diem_thi', label: 'Điểm thi' },
  { value: 'tuyen_sinh', label: 'Tuyển sinh' },
  { value: 'hoc_phi', label: 'Học phí' },
  { value: 'vien_chuc', label: 'Viên chức' },
  { value: 'de_tai', label: 'Đề tài NCKH' },
];

export default function CreateReportPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [selectedChart, setSelectedChart] = useState('bar');
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    datasource: DATASOURCES[0].id,
    field: FIELDS[0].value,
    dateRange: 'this_year',
    refreshInterval: 'manual',
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate('/bi/bao-cao'), 600);
  };

  const chartType = CHART_TYPES.find((c) => c.id === selectedChart);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo báo cáo mới"
        description="Thiết kế báo cáo phân tích dữ liệu theo nhu cầu"
        breadcrumbs={[
          { label: 'BI', href: '/bi' },
          { label: 'Thiết kế báo cáo', href: '/bi/bao-cao' },
          { label: 'Tạo báo cáo mới' },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/bi/bao-cao')}>
            Quay lại
          </Button>
        }
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Left: Form */}
        <div className="space-y-4">
          {/* Report info */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin báo cáo</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                  Tên báo cáo <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="VD: Báo cáo tuyển sinh theo khu vực năm 2026"
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Mô tả ngắn về nội dung và mục đích của báo cáo..."
                  rows={2}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Danh mục</label>
                  <select
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Tần suất cập nhật</label>
                  <select
                    value={form.refreshInterval}
                    onChange={(e) => update('refreshInterval', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    <option value="manual">Thủ công</option>
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart type */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Loại biểu đồ</h3>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {CHART_TYPES.map((ct) => {
                  const active = selectedChart === ct.id;
                  return (
                    <button
                      key={ct.id}
                      onClick={() => setSelectedChart(ct.id)}
                      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.06)] shadow-sm'
                          : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] hover:border-[rgb(var(--primary)/0.3)]'
                      }`}
                    >
                      <div className={`shrink-0 ${active ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-muted))]'}`}>
                        {ct.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${active ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-primary))]'}`}>
                          {ct.label}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5 leading-relaxed">{ct.desc}</p>
                      </div>
                      {active && (
                        <div className="ml-auto shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-[rgb(var(--primary))]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Data source */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Nguồn dữ liệu</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Hệ thống nguồn</label>
                  <select
                    value={form.datasource}
                    onChange={(e) => update('datasource', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {DATASOURCES.map((ds) => <option key={ds.id} value={ds.id}>{ds.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Trường dữ liệu</label>
                  <select
                    value={form.field}
                    onChange={(e) => update('field', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Khoảng thời gian</label>
                  <select
                    value={form.dateRange}
                    onChange={(e) => update('dateRange', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    <option value="this_month">Tháng này</option>
                    <option value="this_quarter">Quý này</option>
                    <option value="this_year">Năm nay</option>
                    <option value="last_year">Năm trước</option>
                    <option value="all">Tất cả thời gian</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/bi/bao-cao')}>Hủy bỏ</Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} disabled={saved}>
              {saved ? '✓ Đã lưu' : 'Tạo báo cáo'}
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Xem trước</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
                  {chartType?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[rgb(var(--text-primary))] line-clamp-2">
                    {form.name || 'Tên báo cáo'}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{chartType?.label}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Danh mục', value: form.category },
                  { label: 'Nguồn dữ liệu', value: DATASOURCES.find(d => d.id === form.datasource)?.label },
                  { label: 'Trường', value: FIELDS.find(f => f.value === form.field)?.label },
                  { label: 'Tần suất', value: form.refreshInterval === 'manual' ? 'Thủ công' : form.refreshInterval === 'daily' ? 'Hàng ngày' : form.refreshInterval === 'weekly' ? 'Hàng tuần' : 'Hàng tháng' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Hướng dẫn</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                'Chọn loại biểu đồ phù hợp với dữ liệu',
                'Biểu đồ cột: so sánh giá trị giữa các nhóm',
                'Biểu đồ đường: hiển thị xu hướng theo thời gian',
                'Biểu đồ tròn: biểu diễn tỷ lệ phần trăm',
                'Báo cáo sẽ được tạo sau khi lưu',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[rgb(var(--text-secondary))]">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
                    {i + 1}
                  </span>
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
