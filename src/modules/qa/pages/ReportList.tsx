import { useState } from 'react';
import {
  Download,
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, Button, Select } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const YEARS = [2026, 2025, 2024];

const SUMMARY_STATS = [
  { label: 'Đơn kiến nghị', value: '42', change: '+8', icon: <FileText className="h-5 w-5" />, color: 'primary' },
  { label: 'Đã xử lý', value: '35', sub: '83.3%', icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
  { label: 'Đang xử lý', value: '5', icon: <Clock className="h-5 w-5" />, color: 'warning' },
  { label: 'Chưa xử lý', value: '2', icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
];

const BY_CATEGORY = [
  { name: 'Giảng dạy', value: 15, color: '#1E3A5F' },
  { name: 'Học phí', value: 8, color: '#2D5D8A' },
  { name: 'CSVC', value: 10, color: '#4A90C4' },
  { name: 'Tuyển sinh', value: 5, color: '#6DB3D8' },
  { name: 'KTX', value: 4, color: '#9ECFFF' },
];

const MONTHLY_TREND = [
  { month: 'T1', received: 5, resolved: 4 },
  { month: 'T2', received: 3, resolved: 3 },
  { month: 'T3', received: 7, resolved: 5 },
  { month: 'T4', received: 4, resolved: 4 },
  { month: 'T5', received: 6, resolved: 5 },
  { month: 'T6', received: 8, resolved: 6 },
];

const SATISFACTION = [
  { name: 'Rất hài lòng', value: 28, color: '#1E3A5F' },
  { name: 'Hài lòng', value: 35, color: '#2D5D8A' },
  { name: 'Bình thường', value: 20, color: '#4A90C4' },
  { name: 'Chưa hài lòng', value: 12, color: '#6DB3D8' },
  { name: 'Rất không hài lòng', value: 5, color: '#9ECFFF' },
];

export default function QAReportList() {
  const [year, setYear] = useState('2026');
  const [tab, setTab] = useState('overview');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo Kết quả Kiểm định"
        description="Tổng hợp kết quả xử lý khiếu nại, khảo sát sự hài lòng"
        breadcrumbs={[{ label: 'QA' }, { label: 'Báo cáo' }]}
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
              className="w-28"
            />
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>Lọc</Button>
            <Button leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
          </div>
        }
      />

      <div className="flex gap-1 border-b border-[rgb(var(--border)/0.6)]">
        {[{ id: 'overview', label: 'Tổng quan' }, { id: 'trend', label: 'Xu hướng' }, { id: 'survey', label: 'Khảo sát' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.id ? 'border-b-2 border-[rgb(var(--primary))] text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SUMMARY_STATS.map((s) => (
              <Card key={s.label}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                    <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
                    {s.change && <p className="text-xs text-[rgb(var(--success))]">{s.change} năm nay</p>}
                    {s.sub && <p className="text-xs text-[rgb(var(--text-muted))]">{s.sub}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-4">Khiếu nại theo lĩnh vực</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={BY_CATEGORY} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {BY_CATEGORY.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-4">Top vấn đề thường gặp</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Giảng viên đến lớp muộn', count: 12, pct: '28.5%' },
                    { name: 'Wifi phòng học không ổn định', count: 10, pct: '23.8%' },
                    { name: 'Học phí bị tính trùng', count: 7, pct: '16.6%' },
                    { name: 'Thiết bị giảng dạy hỏng', count: 6, pct: '14.2%' },
                    { name: 'Thông tin tuyển sai', count: 5, pct: '11.9%' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="flex-1 text-sm text-[rgb(var(--text-primary))]">{item.name}</span>
                      <div className="h-2 flex-1 rounded-full bg-[rgb(var(--border)/0.3)]">
                        <div className="h-2 rounded-full bg-[rgb(var(--primary))]" style={{ width: item.pct }} />
                      </div>
                      <span className="w-12 text-right text-xs text-[rgb(var(--text-muted))]">{item.count} KN</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {tab === 'trend' && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-4">Xu hướng khiếu nại theo tháng</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_TREND}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="received" fill="rgb(var(--primary))" name="Tiếp nhận" radius={[3,3,0,0]} />
                  <Bar dataKey="resolved" fill="rgb(var(--success))" name="Giải quyết" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'survey' && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-4">Khảo sát mức độ hài lòng của sinh viên</h3>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={SATISFACTION} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {SATISFACTION.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[rgb(var(--primary))]">87%</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">Tổng mức hài lòng</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Rất hài lòng + Hài lòng</span><span className="font-bold text-[rgb(var(--success))]">63%</span></div>
                  <div className="flex justify-between"><span>Bình thường</span><span className="font-bold">20%</span></div>
                  <div className="flex justify-between"><span>Chưa hài lòng + Rất không hài lòng</span><span className="font-bold text-[rgb(var(--error))]">17%</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
