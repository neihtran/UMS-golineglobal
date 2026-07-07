import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen, Award, ArrowLeft, Download, Edit2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useStudentDetail } from '@/hooks/useSis';

export default function StudentDetail() {
  const { t } = useTranslation('sis');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: studentData, isLoading } = useStudentDetail(id || '');
  const s = studentData as any;

  if (isLoading || !s) {
    return (
      <div className="space-y-6">
        <PageHeader title={isLoading ? 'Đang tải...' : 'Không tìm thấy'} breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Sinh viên' }]} />
        <div className="flex items-center justify-center h-64">
          <p className="text-[rgb(var(--text-muted))]">{isLoading ? 'Đang tải thông tin sinh viên...' : 'Không tìm thấy sinh viên này.'}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: t('student.detail.profile') },
    { id: 'grades', label: t('student.detail.grades') },
    { id: 'ctdt', label: t('student.detail.ctdt') },
    { id: 'schedule', label: t('student.detail.schedule') },
    { id: 'certificates', label: t('student.detail.certificates') },
  ];

  const displayName = s.name || s.displayName || '—';
  const msv = s.studentCode || (s as any).msv || s.code || '';
  const initials = displayName.split(' ').slice(-2).map((n: string) => n[0]).join('');
  const statusVariant = s.status === 'studying' || s.status === 'active' ? 'success' : s.status === 'graduated' ? 'primary' : 'neutral';

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayName}
        description={`${msv} · ${s.major || s.department?.name || ''} · ${s.className || s.class || ''}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('student.breadcrumb.list', { defaultValue: 'Sinh viên' }), href: '/sis/sinh-vien' },
          { label: displayName },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/sinh-vien')}>{t('student.detail.back')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('student.detail.exportProfile')}</Button>
            <Button leftIcon={<Edit2 className="h-4 w-4" />}>{t('student.detail.edit')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-2xl font-bold text-white mb-4 ring-4 ring-[rgb(var(--primary)/0.2)]">
                {initials}
              </div>
              <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">{displayName}</h2>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{msv}</p>
              <Badge variant={statusVariant} dot className="mt-2">{s.statusLabel || s.status || 'Đang học'}</Badge>
              <div className="mt-6 w-full space-y-2.5">
                {[
                  { label: 'Ngày sinh', value: s.dob ? new Date(s.dob).toLocaleDateString('vi-VN') : '' },
                  { label: 'Lớp', value: s.className || s.class || '' },
                  { label: 'Khoa', value: s.department?.name || (s as any).dept || '' },
                  { label: 'Khóa', value: s.cohort || '' },
                  { label: 'GPA', value: s.gpa ? `${s.gpa.toFixed(2)} / 4.0` : '' },
                  { label: 'Tín chỉ tích lũy', value: s.credits ? `${s.credits} TC` : '' },
                  { label: 'Email', value: s.email || '' },
                  { label: 'Điện thoại', value: s.phone || '' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs border-b border-[rgb(var(--border)/0.4)] pb-2 last:border-0 last:pb-0">
                    <span className="text-[rgb(var(--text-muted))]">{label}</span>
                    <span className="font-medium text-[rgb(var(--text-primary))] text-right max-w-[140px] truncate">{value || '—'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {[
                { icon: <BookOpen className="h-4 w-4" />, label: 'GPA tích lũy', value: s.gpa ? s.gpa.toFixed(2) : '—', color: 'primary' },
                { icon: <Award className="h-4 w-4" />, label: 'Tín chỉ đạt', value: s.credits ? String(s.credits) : '—', color: 'success' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))]">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${stat.color})/0.1)] text-[rgb(var(--${stat.color}))]`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{stat.label}</p>
                    <p className="font-bold text-[rgb(var(--text-primary))]">{stat.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main content with tabs */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex gap-1 px-4 pt-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
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
              {/* Profile tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Personal info */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-3">Thông tin cá nhân</h4>
                    <div className="grid grid-cols-2 gap-x-8">
                      {[
                        { label: 'Họ và tên', value: displayName },
                        { label: 'Mã sinh viên', value: msv },
                        { label: 'Ngày sinh', value: s.dob ? new Date(s.dob).toLocaleDateString('vi-VN') : '' },
                        { label: 'Giới tính', value: s.gender || '' },
                        { label: 'Số CCCD', value: s.cccd || '' },
                        { label: 'Dân tộc', value: s.ethnicity || '' },
                        { label: 'Quốc tịch', value: s.nationality || '' },
                        { label: 'Tôn giáo', value: s.religion || '' },
                        { label: 'Địa chỉ', value: s.address || '' },
                        { label: 'Điện thoại', value: s.phone || '' },
                        { label: 'Email', value: s.email || '' },
                        { label: 'Ngày nhập học', value: s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString('vi-VN') : '' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-4 py-2 border-b border-[rgb(var(--border)/0.4)] last:border-0">
                          <p className="w-36 shrink-0 text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide">{label}</p>
                          <p className="text-sm text-[rgb(var(--text-primary))]">{value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Academic info */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-3">Thông tin học tập</h4>
                    <div className="grid grid-cols-2 gap-x-8">
                      {[
                        { label: 'Lớp', value: s.className || s.class || '' },
                        { label: 'Ngành', value: s.major || s.department?.name || '' },
                        { label: 'Khoa', value: (s as any).faculty?.name || (s as any).dept || '' },
                        { label: 'Khóa', value: s.cohort || '' },
                        { label: 'Hệ đào tạo', value: (s as any).programType || '' },
                        { label: 'Năm học hiện tại', value: (s as any).currentYear || '' },
                        { label: 'Học kỳ hiện tại', value: (s as any).currentSemester || '' },
                        { label: 'GPA tích lũy', value: s.gpa ? s.gpa.toFixed(2) : '' },
                        { label: 'Tổng tín chỉ', value: s.credits ? `${s.credits} TC` : '' },
                        { label: 'Dự kiến tốt nghiệp', value: (s as any).expectedGraduation ? new Date((s as any).expectedGraduation).toLocaleDateString('vi-VN') : '' },
                        { label: 'Trạng thái', value: s.statusLabel || s.status || '' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-4 py-2 border-b border-[rgb(var(--border)/0.4)] last:border-0">
                          <p className="w-36 shrink-0 text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide">{label}</p>
                          <p className="text-sm text-[rgb(var(--text-primary))]">{value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Grades tab */}
              {activeTab === 'grades' && (
                <div className="text-center py-12">
                  <BookOpen className="h-10 w-10 mx-auto text-[rgb(var(--text-muted))] mb-3" />
                  <p className="text-sm text-[rgb(var(--text-muted))]">Dữ liệu điểm sẽ được tải từ API khi backend có endpoint điểm sinh viên.</p>
                </div>
              )}

              {/* CTDT tab */}
              {activeTab === 'ctdt' && (
                <div className="text-center py-12">
                  <BookOpen className="h-10 w-10 mx-auto text-[rgb(var(--text-muted))] mb-3" />
                  <p className="text-sm text-[rgb(var(--text-muted))]">Chương trình đào tạo của sinh viên sẽ được tải từ API.</p>
                </div>
              )}

              {/* Schedule tab */}
              {activeTab === 'schedule' && (
                <div className="text-center py-12">
                  <BookOpen className="h-10 w-10 mx-auto text-[rgb(var(--text-muted))] mb-3" />
                  <p className="text-sm text-[rgb(var(--text-muted))]">Thời khóa biểu sẽ được tải từ API khi có endpoint lịch học.</p>
                </div>
              )}

              {/* Certificates tab */}
              {activeTab === 'certificates' && (
                <div className="text-center py-12">
                  <Award className="h-10 w-10 mx-auto text-[rgb(var(--text-muted))] mb-3" />
                  <p className="text-sm text-[rgb(var(--text-muted))]">Chứng chỉ và bằng cấp sẽ được tải từ API khi có endpoint chứng chỉ.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
