import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Plug } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';

interface IntegrationDetailProps {
  id?: string;
}

type IntegrationStatus = 'active' | 'warning' | 'inactive';
type IntegrationDirection = 'push' | 'pull' | 'bidirectional';

const INTEGRATIONS_MAP: Record<string, {
  id: string; name: string; type: string; direction: IntegrationDirection;
  status: IntegrationStatus; uptime: number; lastSync: string; eventsToday: number;
  endpoint: string; description: string;
}> = {
  i1: { id: 'i1', name: 'HEMIS API', type: 'Government', direction: 'bidirectional', status: 'active', uptime: 99.8, lastSync: '2026-06-26 07:30:15', eventsToday: 1247, endpoint: 'https://hemis.moet.edu.vn/api/v1', description: 'Kết nối dữ liệu sinh viên, chương trình đào tạo, văn bằng với HEMIS quốc gia.' },
  i2: { id: 'i2', name: 'Học trực tuyến LMS', type: 'LMS', direction: 'pull', status: 'active', uptime: 99.2, lastSync: '2026-06-26 07:25:00', eventsToday: 480, endpoint: 'https://lms.truong.edu.vn/api', description: 'Nhận kết quả học tập, điểm thi, tiến độ sinh viên.' },
  i3: { id: 'i3', name: 'Email University', type: 'Email', direction: 'push', status: 'active', uptime: 100, lastSync: '2026-06-26 07:28:00', eventsToday: 124, endpoint: 'smtp://email.truong.edu.vn', description: 'Gửi thông báo, nhắc nhở, newsletter cho sinh viên và giảng viên.' },
  i4: { id: 'i4', name: 'Cổng thông tin PORTAL', type: 'Portal', direction: 'bidirectional', status: 'active', uptime: 99.5, lastSync: '2026-06-26 07:27:00', eventsToday: 85, endpoint: 'https://portal.truong.edu.vn/api', description: 'Hiển thị tin tức, thông báo, dữ liệu công khai.' },
  i5: { id: 'i5', name: 'Thi trực tuyến EXAM', type: 'Exam', direction: 'pull', status: 'active', uptime: 98.7, lastSync: '2026-06-26 07:20:00', eventsToday: 62, endpoint: 'https://exam.truong.edu.vn/api', description: 'Lấy danh sách thi, gửi kết quả thi về hệ thống.' },
  i6: { id: 'i6', name: 'Thư viện số LIB', type: 'Library', direction: 'pull', status: 'warning', uptime: 95.2, lastSync: '2026-06-26 06:30:00', eventsToday: 28, endpoint: 'https://lib.truong.edu.vn/api', description: 'Tra cứu tài liệu, lịch sử mượn trả.' },
  i7: { id: 'i7', name: 'API Tuyển sinh Bộ', type: 'Government', direction: 'push', status: 'active', uptime: 100, lastSync: '2026-06-26 07:00:00', eventsToday: 3, endpoint: 'https://tuyensinh.moet.gov.vn/api', description: 'Gửi dữ liệu tuyển sinh lên hệ thống Bộ GD&ĐT.' },
  i8: { id: 'i8', name: 'Hệ thống KTX', type: 'KTX', direction: 'bidirectional', status: 'warning', uptime: 94.1, lastSync: '2026-06-26 05:30:00', eventsToday: 15, endpoint: 'https://ktx.truong.edu.vn/api', description: 'Đồng bộ danh sách sinh viên ở KTX.' },
  i9: { id: 'i9', name: 'Chatbot hỗ trợ SV', type: 'LMS', direction: 'pull', status: 'active', uptime: 99.9, lastSync: '2026-06-26 07:29:00', eventsToday: 340, endpoint: 'https://chatbot.truong.edu.vn/api', description: 'Tự động trả lời thắc mắc sinh viên 24/7.' },
  i10: { id: 'i10', name: 'Hệ thống hóa đơn điện tử', type: 'FIN', direction: 'push', status: 'active', uptime: 99.4, lastSync: '2026-06-26 07:15:00', eventsToday: 56, endpoint: 'https://einvoice.vnpt.vn/api', description: 'Gửi hóa đơn điện tử qua VNPT/eSMS.' },
};

const EVENTS = [
  { id: 'e1', message: 'Dong bo danh sach sinh vien moi: 45 ban ghi', timestamp: '2026-06-26 07:30:15', duration: 1200, status: 'success' as const },
  { id: 'e2', message: 'Cap nhat chuong trinh dao tao: 12 mon hoc', timestamp: '2026-06-26 07:00:00', duration: 800, status: 'success' as const },
  { id: 'e3', message: 'Canh bao: 3 sinh vien chua co ma dinh danh', timestamp: '2026-06-25 16:45:00', duration: null, status: 'warning' as const },
  { id: 'e4', message: 'Loi xac thuc OAuth2 - Token het han (401)', timestamp: '2026-06-25 14:20:00', duration: null, status: 'failure' as const },
  { id: 'e5', message: 'Lam moi Access Token thanh cong', timestamp: '2026-06-25 14:21:00', duration: 200, status: 'success' as const },
];

const EVENT_CONFIG: Record<string, { variant: 'success' | 'error' | 'warning'; label: string }> = {
  success: { variant: 'success', label: 'Thanh cong' },
  failure: { variant: 'error', label: 'Loi' },
  warning: { variant: 'warning', label: 'Canh bao' },
};

const DIR_CONFIG: Record<string, string> = {
  push: 'Day du lieu', pull: 'Nhan du lieu', bidirectional: 'Hai chieu',
};

export default function IntegrationDetail({ id }: IntegrationDetailProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const intg = INTEGRATIONS_MAP[actualId] ?? INTEGRATIONS_MAP['i1'];
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          leftIcon={<RefreshCw className={'h-4 w-4' + (syncing ? ' animate-spin' : '')} />}
          onClick={handleSync}
        >
          Đồng bộ ngay
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Trang thai</p>
              <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-0.5">Hoat dong</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
              <Plug className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Uptime</p>
              <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-0.5">{intg.uptime}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Su kien hom nay</p>
              <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-0.5">{intg.eventsToday.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Dong bo cuoi</p>
              <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-0.5">{intg.lastSync}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Mo ta ket noi</h3>
        </div>
        <CardContent className="pt-4">
          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{intg.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="info">{DIR_CONFIG[intg.direction]}</Badge>
            <Badge variant="neutral">{intg.type}</Badge>
            <Badge variant="neutral">OAuth 2.0</Badge>
            <Badge variant="neutral">REST API</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Nhat ky su kien</h3>
          <Badge variant="info" size="sm">{EVENTS.length} su kien gan nhat</Badge>
        </div>
        <div className="divide-y divide-[rgb(var(--border)/0.4]">
          {EVENTS.map((ev) => {
            const ec = EVENT_CONFIG[ev.status];
            return (
              <div key={ev.id} className="flex items-start gap-4 px-5 py-4">
                <div className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--' + ec.variant + ')/0.1]'}>
                  {ev.status === 'success' && <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))]" />}
                  {ev.status === 'warning' && <AlertTriangle className="h-4 w-4 text-[rgb(var(--warning))]" />}
                  {ev.status === 'failure' && <XCircle className="h-4 w-4 text-[rgb(var(--error))]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[rgb(var(--text-primary))]">{ev.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[rgb(var(--text-muted))]">
                    <span>{ev.timestamp}</span>
                    {ev.duration && <span> - Thoi gian: {ev.duration}ms</span>}
                  </div>
                </div>
                <Badge variant={ec.variant} size="sm">{ec.label}</Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
