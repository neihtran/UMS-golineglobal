import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const WEEK_DAYS_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
];

const SCHEDULE = [
  { id: 's1', subject: 'Nhập môn Lập trình Python', code: 'CS101', room: 'P.301', day: 0, start: 1, end: 3, instructor: 'TS. Nguyễn Văn Minh', type: 'LT', color: 'primary' },
  { id: 's2', subject: 'Giải tích 2', code: 'MATH201', room: 'P.401', day: 1, start: 1, end: 3, instructor: 'PGS.TS. Lê Thị Lan', type: 'LT', color: 'accent' },
  { id: 's3', subject: 'Tiếng Anh Học thuật', code: 'ENG301', room: 'P.205', day: 2, start: 2, end: 4, instructor: 'ThS. Trần Hoàng Nam', type: 'LT', color: 'info' },
  { id: 's4', subject: 'Nhập môn Lập trình Python', code: 'CS101', room: 'P.Lab1', day: 3, start: 3, end: 5, instructor: 'TS. Nguyễn Văn Minh', type: 'TH', color: 'primary' },
  { id: 's5', subject: 'Vật lý Đại cương', code: 'PHYS101', room: 'P.501', day: 4, start: 1, end: 3, instructor: 'TS. Bùi Minh Tuấn', type: 'LT', color: 'success' },
  { id: 's6', subject: 'Triết học Mác-Lênin', code: 'PHIL101', room: 'P.102', day: 0, start: 4, end: 6, instructor: 'ThS. Đặng Thu Hà', type: 'LT', color: 'warning' },
];

const TYPE_BADGE: Record<string, 'primary' | 'accent' | 'info' | 'success' | 'warning'> = {
  LT: 'primary',
  TH: 'accent',
};

const COLOR_MAP: Record<string, string> = {
  primary: 'rgb(var(--primary))',
  accent: 'rgb(var(--accent))',
  info: 'rgb(var(--info))',
  success: 'rgb(var(--success))',
  warning: 'rgb(var(--warning))',
};

export default function StudentSchedule() {
  const { t } = useTranslation('portal');
  const [selectedWeek, setSelectedWeek] = useState(0);

  const WEEK_DAYS = WEEK_DAYS_KEYS.map((k) => t(`schedule.day.${k}`));

  const getSlot = (day: number, slot: number) =>
    SCHEDULE.find((s) => s.day === day && slot >= s.start && slot < s.end);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('schedule.title')}
        description={t('schedule.description')}
        breadcrumbs={[
          { label: 'PORTAL', href: '/portal' },
          { label: t('schedule.breadcrumb') },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/portal">{t('profile.backToHome')}</Link>
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setSelectedWeek((w) => Math.max(0, w - 1))}>
          ← {t('schedule.weekPrev')}
        </Button>
        <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">
          {t('schedule.week')} {selectedWeek + 1} — {(selectedWeek + 15) * 7 - 6}/{((selectedWeek + 15) * 7).toString().slice(-2)}/06/2026
        </span>
        <Button variant="outline" size="sm" onClick={() => setSelectedWeek((w) => w + 1)}>
          {t('schedule.weekNext')} →
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-[rgb(var(--border)/0.6)]">
              <div className="px-2 py-3" />
              {WEEK_DAYS.map((d, i) => (
                <div key={d} className="px-3 py-3 text-center border-l border-[rgb(var(--border)/0.6)]">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{d}</p>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                    {15 + i}/06
                  </p>
                </div>
              ))}
            </div>

            {TIME_SLOTS.map((time, si) => (
              <div key={time} className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-[rgb(var(--border)/0.4)]">
                <div className="px-2 py-2 text-[10px] text-[rgb(var(--text-muted))] flex items-center justify-end">
                  {time}
                </div>
                {WEEK_DAYS.map((_, di) => {
                  const slot = getSlot(di, si);
                  if (!slot) {
                    return (
                      <div key={di} className="h-12 border-l border-[rgb(var(--border)/0.3)]" />
                    );
                  }
                  const rowSpan = slot.end - slot.start;
                  const isFirst = slot.start === si;
                  if (!isFirst) return null;
                  return (
                    <div
                      key={di}
                      className={`border-l border-[rgb(var(--border)/0.3)] p-1.5 m-1 rounded-lg cursor-pointer hover:brightness-110 transition-all`}
                      style={{
                        background: `${COLOR_MAP[slot.color]}15`,
                        borderLeft: `3px solid ${COLOR_MAP[slot.color]}`,
                        gridRow: `span ${rowSpan}`,
                      }}
                    >
                      <p className="text-xs font-semibold text-[rgb(var(--text-primary))] truncate">
                        {slot.code}
                      </p>
                      <p className="text-[10px] text-[rgb(var(--text-secondary))] truncate">
                        {slot.room}
                      </p>
                      <Badge variant={TYPE_BADGE[slot.type] || 'neutral'} size="sm">
                        {t(`schedule.type.${slot.type}`)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
            {t('schedule.todaySchedule')} — {WEEK_DAYS[new Date().getDay() - 1]}
          </h3>
        </div>
        <CardContent className="divide-y divide-[rgb(var(--border)/0.5)]">
          {SCHEDULE.filter((s) => s.day === 0).map((s) => (
            <div key={s.id} className="flex items-center gap-4 py-3">
              <div
                className="h-10 w-1 shrink-0 rounded-full"
                style={{ background: COLOR_MAP[s.color] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{s.subject}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-[rgb(var(--text-muted))]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {TIME_SLOTS[s.start]} - {TIME_SLOTS[s.end]}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {s.room}
                  </span>
                </div>
              </div>
              <Badge variant={TYPE_BADGE[s.type] || 'neutral'} size="sm">
                {t(`schedule.type.${s.type}`)}
              </Badge>
            </div>
          ))}
          {SCHEDULE.filter((s) => s.day === 0).length === 0 && (
            <p className="py-6 text-center text-sm text-[rgb(var(--text-muted))]">
              {t('schedule.noClassToday')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
