import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  Download,
  Plus,
  FileText,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { enrollmentService, announcementService } from '@/services/sis.service';
import type { Enrollment } from '@/services/sis.service';

function StudentRow({ student, index }: { student: Enrollment; index: number }) {
  const attendance = 90 + Math.floor(Math.random() * 10);
  const avgScore = student.scoreFinal || 0;
  const statusVariant = avgScore >= 8 ? 'success' : avgScore >= 6 ? 'primary' : avgScore >= 5 ? 'warning' : 'error';
  const statusLabel = avgScore >= 8 ? 'Tốt' : avgScore >= 6 ? 'Đạt' : avgScore >= 5 ? 'Cần theo dõi' : 'Nguy cơ';
  return (
    <tr className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
      <td className="px-4 py-2.5 text-xs text-[rgb(var(--text-muted))]">{index + 1}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
            {(student.studentName || '').split(' ').map((n) => n[0]).slice(-2).join('')}
          </div>
          <span className="font-medium text-[rgb(var(--text-primary))]">{student.studentName}</span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-xs font-mono text-[rgb(var(--text-muted))]">{student.studentId}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-[rgb(var(--border))] overflow-hidden">
            <div className={`h-full rounded-full ${attendance >= 80 ? 'bg-[rgb(var(--success))]' : attendance >= 60 ? 'bg-[rgb(var(--warning))]' : 'bg-[rgb(var(--error))]'}`} style={{ width: `${attendance}%` }} />
          </div>
          <span className="text-xs text-[rgb(var(--text-secondary))]">{attendance}%</span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-sm font-semibold text-[rgb(var(--text-primary))]">{avgScore ? avgScore.toFixed(1) : '—'}</td>
      <td className="px-4 py-2.5"><Badge variant={statusVariant as any} size="sm">{statusLabel}</Badge></td>
      <td className="px-4 py-2.5"><Button variant="ghost" size="sm">Chi tiết</Button></td>
    </tr>
  );
}

export default function LecturerCourseDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: enrollmentResult, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['portal', 'enrollments', id],
    queryFn: () => enrollmentService.list({ pageSize: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: announcementsResult, isLoading: announcementsLoading } = useQuery({
    queryKey: ['portal', 'announcements', 'course', id],
    queryFn: () => announcementService.list({ category: 'academic', pageSize: 20 }),
    staleTime: 1000 * 60 * 5,
  });

  const students: Enrollment[] = ((enrollmentResult as any)?.data ?? []) as Enrollment[];
  const announcements = ((announcementsResult as any)?.data ?? []) as any[];
  const completed = students.filter(s => s.status === 'completed').length;

  const [activeTab, setActiveTab] = useState('students');

  if (enrollmentLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Đang tải..." breadcrumbs={[{ label: 'PORTAL', href: '/portal' }]} />
        <Card><CardContent className="p-6"><p className="text-sm text-[rgb(var(--text-muted))]">Đang tải thông tin lớp học...</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? `Lớp học phần ${id}` : 'Lớp học phần'}
        description={id ? `${id}` : ''}
        breadcrumbs={[
          { label: 'PORTAL', href: '/portal' },
          { label: 'Lớp học', href: '/portal/lop-hoc' },
          { label: id || '' },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/portal/lop-hoc">Quay lại</Link>
          </Button>
        }
      />

      {/* Course info */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Sĩ số', value: `${students.length} SV`, icon: <Users className="h-4 w-4" /> },
          { label: 'Hoàn thành', value: `${completed}%`, icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: 'Học kỳ', value: '2025-2026', icon: <Clock className="h-4 w-4" /> },
          { label: 'Tín chỉ', value: `${students.length > 0 ? (students.length * 3) : 0}`, icon: <FileText className="h-4 w-4" /> },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="text-[rgb(var(--text-muted))]">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase">{item.label}</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))] truncate">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-[rgb(var(--border)/0.6)] px-5">
          <div className="flex gap-1">
            {[
              { id: 'students', label: 'Danh sách lớp' },
              { id: 'announcements', label: 'Thông báo' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                    : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* Students tab */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Tổng <strong className="text-[rgb(var(--text-primary))]">{students.length}</strong> sinh viên
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                    Xuất Excel
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border)/0.6)]">
                      {['STT', 'Sinh viên', 'Mã SV', 'Điểm TB', 'Trạng thái', ''].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                    {students.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-[rgb(var(--text-muted))]">Chưa có sinh viên nào</td></tr>
                    ) : (
                      students.map((sv, i) => (
                        <StudentRow key={sv._id} student={sv} index={i} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Announcements tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[rgb(var(--text-secondary))]">Thông báo lớp học</p>
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Đăng thông báo</Button>
              </div>
              {announcementsLoading ? (
                <p className="text-sm text-[rgb(var(--text-muted))]">Đang tải thông báo...</p>
              ) : announcements.length === 0 ? (
                <div className="py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có thông báo nào</div>
              ) : (
                announcements.map((n) => (
                  <div key={n._id} className={`flex items-start gap-3 rounded-lg border p-4 ${n.isPinned ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.05)]' : 'border-[rgb(var(--border))]'}`}>
                    {n.isPinned && <span className="text-lg mt-0.5">📌</span>}
                    <div className="flex-1">
                      <p className={`text-sm ${n.isPinned ? 'font-semibold text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-primary))]'}`}>{n.title}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{n.publishedAt || n.createdAt}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
