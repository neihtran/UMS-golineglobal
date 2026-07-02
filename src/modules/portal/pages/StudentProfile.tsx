import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Upload,
  FileText,
  Download,
  Award,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const STUDENT_INFO = {
  name: 'Nguyễn Văn An',
  msv: 'SV2021002345',
  class: 'K60 – CNTT',
  major: 'Công nghệ Thông tin',
  faculty: 'Khoa Công nghệ Thông tin',
  email: 'an.nguyen@truong.edu.vn',
  phone: '0912 345 678',
  dob: '15/03/2003',
  gender: 'Nam',
  ethnicity: 'Kinh',
  religion: 'Không',
  cccd: '00120300XXXX',
  address: '123 Nguyễn Văn Linh, Hà Nội',
  hometown: 'Hà Nội',
  status: 'Đang học',
  gpa: 3.42,
  credits: 62,
  admissionDate: '01/09/2021',
  avatar: null,
};

const DOCUMENTS = [
  { name: 'CCCD mặt trước', type: 'image', size: '1.2 MB', date: '2021-09-01' },
  { name: 'CCCD mặt sau', type: 'image', size: '1.1 MB', date: '2021-09-01' },
  { name: 'Bằng tốt nghiệp THPT', type: 'pdf', size: '2.4 MB', date: '2021-09-01' },
  { name: 'Giấy chứng nhận kết quả THPT', type: 'pdf', size: '0.8 MB', date: '2021-09-01' },
];

export default function StudentProfile() {
  const { t } = useTranslation('portal');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('profile.title')}
        description={t('profile.description')}
        breadcrumbs={[
          { label: 'PORTAL', href: '/portal' },
          { label: t('profile.breadcrumb') },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/portal">{t('profile.backToHome')}</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center text-center p-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-3xl font-bold text-[rgb(var(--primary))]">
              {STUDENT_INFO.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <h2 className="mt-4 text-lg font-bold text-[rgb(var(--text-primary))]">{STUDENT_INFO.name}</h2>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{STUDENT_INFO.msv}</p>
            <Badge variant="primary" className="mt-2">{STUDENT_INFO.status}</Badge>

            <div className="mt-6 w-full space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                <span className="text-[rgb(var(--text-secondary))] truncate">{STUDENT_INFO.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                <span className="text-[rgb(var(--text-secondary))]">{STUDENT_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                <span className="text-[rgb(var(--text-secondary))] truncate">{STUDENT_INFO.address}</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="mt-6 w-full" leftIcon={<Upload className="h-4 w-4" />}>
              {t('profile.changeAvatar')}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {t('profile.academicInfo')}
              </h3>
            </div>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { label: t('profile.field.class'), value: STUDENT_INFO.class, icon: <User className="h-4 w-4" /> },
                  { label: t('profile.field.major'), value: STUDENT_INFO.major, icon: <BookOpen className="h-4 w-4" /> },
                  { label: t('profile.field.faculty'), value: STUDENT_INFO.faculty, icon: <GraduationCap className="h-4 w-4" /> },
                  { label: t('profile.field.gpa'), value: `${STUDENT_INFO.gpa}/4.0`, icon: <Award className="h-4 w-4" /> },
                  { label: t('profile.field.credits'), value: `${STUDENT_INFO.credits}/120`, icon: <BookOpen className="h-4 w-4" /> },
                  { label: t('profile.field.admissionDate'), value: STUDENT_INFO.admissionDate, icon: <Calendar className="h-4 w-4" /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-lg border border-[rgb(var(--border))] p-3">
                    <span className="mt-0.5 text-[rgb(var(--text-muted))]">{item.icon}</span>
                    <div>
                      <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase">{item.label}</p>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {t('profile.personalInfo')}
              </h3>
            </div>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('profile.field.fullName'), value: STUDENT_INFO.name },
                  { label: t('profile.field.studentCode'), value: STUDENT_INFO.msv },
                  { label: t('profile.field.dob'), value: STUDENT_INFO.dob },
                  { label: t('profile.field.gender'), value: STUDENT_INFO.gender },
                  { label: t('profile.field.ethnicity'), value: STUDENT_INFO.ethnicity },
                  { label: t('profile.field.religion'), value: STUDENT_INFO.religion },
                  { label: t('profile.field.cccd'), value: STUDENT_INFO.cccd },
                  { label: t('profile.field.birthplace'), value: STUDENT_INFO.hometown },
                  { label: t('profile.field.address'), value: STUDENT_INFO.address, full: true },
                ].map((item) => (
                  <div key={item.label} className={item.full ? 'col-span-2' : ''}>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('profile.documents')}</h3>
            </div>
            <CardContent className="divide-y divide-[rgb(var(--border)/0.5)]">
              {DOCUMENTS.map((doc) => (
                <div key={doc.name} className="flex items-center gap-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                    <FileText className="h-5 w-5 text-[rgb(var(--primary))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">{doc.name}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{doc.type.toUpperCase()} · {doc.size} · {doc.date}</p>
                  </div>
                  <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                    {t('profile.download')}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
