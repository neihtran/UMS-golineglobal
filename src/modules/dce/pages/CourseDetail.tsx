import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Download, Trash2, Edit3,
  Users, CheckCircle2, Award, Target,
  Star,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const COURSE = {
  id: 'c01',
  code: 'DCE-2026-001',
  title: 'Nền tảng An toàn thông tin cho người bắt đầu',
  domain: 'CNTT',
  level: 'Sơ cấp',
  format: 'E-learning',
  duration: '20 tiếng',
  instructor: 'GS.TS. Nguyễn Hoàng Long',
  status: 'published',
  description: 'Khóa học cung cấp kiến thức nền tảng về an toàn thông tin, bảo mật mạng, và các phương pháp bảo vệ dữ liệu cá nhân và doanh nghiệp trong môi trường số.',
  objectives: [
    'Hiểu các khái niệm cơ bản về an toàn thông tin và bảo mật mạng',
    'Nhận diện các loại tấn công mạng phổ biến và cách phòng ngừa',
    'Áp dụng các biện pháp bảo vệ dữ liệu cá nhân',
    'Hiểu quy định pháp lý về an toàn thông tin tại Việt Nam',
  ],
  prerequisites: ['Kiến thức cơ bản về máy tính và Internet', 'Không yêu cầu kiến thức chuyên sâu về mạng'],
  tags: ['an-toan-thong-tin', 'bat-mat-mang', 'CNTT', 'DCE'],
  enrolled: 156,
  completed: 112,
  avgScore: 85,
  createdAt: '2026-01-15',
  updatedAt: '2026-06-10',
};

const WEEKLY_PROGRESS = [
  { week: 'Tuần 1', completed: 45, total: 50 },
  { week: 'Tuần 2', completed: 38, total: 45 },
  { week: 'Tuần 3', completed: 30, total: 40 },
  { week: 'Tuần 4', completed: 25, total: 35 },
];

const TOP_STUDENTS = [
  { id: 'sv1', name: 'Nguyễn Văn A', class: 'CNTT-2024', score: 95, progress: 100, completedAt: '2026-06-08' },
  { id: 'sv2', name: 'Trần Thị B', class: 'KT-2024', score: 92, progress: 100, completedAt: '2026-06-07' },
  { id: 'sv3', name: 'Lê Hoàng C', class: 'CNTT-2024', score: 88, progress: 85, completedAt: '' },
  { id: 'sv4', name: 'Phạm Thu D', class: 'SP-2024', score: 85, progress: 70, completedAt: '' },
  { id: 'sv5', name: 'Hoàng Văn E', class: 'CNTT-2023', score: 82, progress: 60, completedAt: '' },
  { id: 'sv6', name: 'Vũ Thị F', class: 'NN-2024', score: 78, progress: 45, completedAt: '' },
];

const ASSESSMENTS = [
  { id: 'a1', title: 'Bài kiểm tra chương 1: Khái niệm cơ bản', type: 'quiz', maxScore: 10, avgScore: 7.8, passRate: 85 },
  { id: 'a2', title: 'Bài tập thực hành: Quét lỗ hổng bảo mật', type: 'practice', maxScore: 20, avgScore: 16.5, passRate: 72 },
  { id: 'a3', title: 'Thảo luận nhóm: Case study tấn công APT', type: 'discussion', maxScore: 10, avgScore: 8.9, passRate: 94 },
  { id: 'a4', title: 'Kiểm tra giữa kỳ', type: 'exam', maxScore: 30, avgScore: 24.2, passRate: 78 },
  { id: 'a5', title: 'Đồ án cuối khóa: Kế hoạch bảo mật tổ chức', type: 'project', maxScore: 30, avgScore: 26.1, passRate: 70 },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'neutral' | 'warning' | 'info'; label: string }> = {
  published: { variant: 'success', label: 'Đã phát hành' },
  draft: { variant: 'neutral', label: 'Nháp' },
  archived: { variant: 'warning', label: 'Lưu trữ' },
};

const ASSESS_TYPE: Record<string, { label: string; variant: 'info' | 'warning' | 'accent' | 'primary' | 'success' }> = {
  quiz: { label: 'Trắc nghiệm', variant: 'info' },
  practice: { label: 'Thực hành', variant: 'accent' },
  discussion: { label: 'Thảo luận', variant: 'primary' },
  exam: { label: 'Thi', variant: 'warning' },
  project: { label: 'Đồ án', variant: 'success' },
};

export default function CourseDetail() {
  const navigate = useNavigate();
  const { id: _id } = useParams<{ id: string }>();
  const course = COURSE;
  const sc = STATUS_CONFIG[course.status];
  const completionRate = Math.round((course.completed / course.enrolled) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chi tiết khóa học: ${course.code}`}
        description={course.title}
        breadcrumbs={[
          { label: 'DCE', href: '/dce' },
          { label: 'Khóa đào tạo', href: '/dce/khoa-dao-tao' },
          { label: course.code },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button variant="outline" leftIcon={<Edit3 className="h-4 w-4" />} onClick={() => {}}>Chỉnh sửa</Button>
            <Button variant="outline" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => {}}>Xóa</Button>
          </>
        }
      />

      {/* Info card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
            <Badge variant="neutral" size="sm">{course.level}</Badge>
            <Badge variant="info" size="sm">{course.format}</Badge>
            <span className="text-xs text-[rgb(var(--text-muted))]">·</span>
            <span className="text-xs text-[rgb(var(--text-secondary))]">Mã: {course.code}</span>
          </div>

          <p className="text-sm text-[rgb(var(--text-secondary))]">{course.description}</p>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Giảng viên', value: course.instructor },
              { label: 'Thời lượng', value: course.duration },
              { label: 'Ngành/Lĩnh vực', value: course.domain },
              { label: 'Ngày tạo', value: course.createdAt },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{item.label}</p>
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-2">Mục tiêu đào tạo</p>
            <ul className="space-y-1.5">
              {course.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[rgb(var(--text-secondary))]">
                  <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))] mt-0.5 shrink-0" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-1">Điều kiện tiên quyết</p>
            <div className="flex flex-wrap gap-2">
              {course.prerequisites.map((p) => (
                <Badge key={p} variant="neutral" size="sm">{p}</Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {course.tags.map((t) => (
              <Badge key={t} variant="info" size="sm">#{t}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Đã ghi danh', value: course.enrolled, icon: <Users className="h-5 w-5" />, color: 'primary' },
          { label: 'Đã hoàn thành', value: course.completed, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: 'Tỷ lệ hoàn thành', value: `${completionRate}%`, icon: <Target className="h-5 w-5" />, color: 'accent' },
          { label: 'Điểm TB', value: `${course.avgScore}%`, icon: <Award className="h-5 w-5" />, color: 'info' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly progress chart */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tiến độ theo tuần</h3>
        </div>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_PROGRESS} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v} HV`, 'Số lượng']}
              />
              <Bar dataKey="total" fill="rgb(var(--border))" radius={[4, 4, 0, 0]} name="Tổng số HV"  animationDuration={1500} animationEasing="ease-out" />
              <Bar dataKey="completed" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name="Đã hoàn thành"  animationDuration={1500} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top students + Assessments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top students */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Học viên xuất sắc</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {['#', 'Họ tên', 'Lớp', 'Điểm', 'Tiến độ', ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {TOP_STUDENTS.map((sv, i) => (
                  <tr key={sv.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <td className="px-4 py-2.5 text-center">
                      {i < 3 ? <Star className="h-4 w-4 text-[rgb(var(--warning))]" /> : <span className="text-xs text-[rgb(var(--text-muted))]">{i + 1}</span>}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[rgb(var(--text-primary))]">{sv.name}</td>
                    <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{sv.class}</td>
                    <td className="px-4 py-2.5 font-semibold text-[rgb(var(--text-primary))]">{sv.score}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                          <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${sv.progress}%` }} />
                        </div>
                        <span className="text-xs text-[rgb(var(--text-muted))]">{sv.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {sv.completedAt && <Badge variant="success" size="sm">Đã hoàn thành</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Assessments */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Đánh giá & bài kiểm tra</h3>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.4)]">
            {ASSESSMENTS.map((a) => {
              const at = ASSESS_TYPE[a.type];
              return (
                <div key={a.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={at.variant} size="sm">{at.label}</Badge>
                      <span className="text-xs text-[rgb(var(--text-muted))]">Tối đa: {a.maxScore} điểm</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{a.avgScore}/{a.maxScore}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{a.passRate}% đạt</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Back */}
      <div className="flex justify-start">
        <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/dce/khoa-dao-tao/ds')}>
          Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}
