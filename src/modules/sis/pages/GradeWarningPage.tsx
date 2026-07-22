import { useState } from 'react';
import { Award, AlertTriangle, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { StudentGradeSheet, GpaHistorySheet, AcademicWarningSheet } from './sheets';

type TabType = 'diem' | 'lich-su-gpa' | 'canh-bao';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'diem', label: 'Điểm', icon: <Award className="h-4 w-4" /> },
  { id: 'lich-su-gpa', label: 'Lịch sử GPA', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'canh-bao', label: 'Cảnh báo học vụ', icon: <AlertTriangle className="h-4 w-4" /> },
];

export default function GradeWarningPage() {
  const [activeTab, setActiveTab] = useState<TabType>('diem');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Điểm & Cảnh báo học vụ"
        description="Quản lý điểm và cảnh báo học vụ của sinh viên"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Điểm & Cảnh báo học vụ' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList>
          {TABS.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="diem" className="mt-4">
          <StudentGradeSheet />
        </TabsContent>

        <TabsContent value="lich-su-gpa" className="mt-4">
          <GpaHistorySheet />
        </TabsContent>

        <TabsContent value="canh-bao" className="mt-4">
          <AcademicWarningSheet />
        </TabsContent>
      </Tabs>
    </div>
  );
}
