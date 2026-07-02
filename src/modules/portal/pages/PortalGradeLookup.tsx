import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, Star, TrendingUp, Award, BookOpen } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SEMESTERS = ['HK2 2025-2026', 'HK1 2025-2026', 'HK2 2024-2025'];

const GRADES = {
  'HK2 2025-2026': [
    { courseCode: 'CS101', courseName: 'Nhập môn Lập trình Python', credits: 3, midterm: 8.5, final: 7.5, practice: 9.0, average: 8.0, letter: 'B+', gpa: 3.5, rank: 12 },
    { courseCode: 'MATH201', courseName: 'Giải tích 2', credits: 4, midterm: 7.0, final: 6.5, practice: null, average: 6.5, letter: 'C+', gpa: 2.0, rank: 28 },
    { courseCode: 'ENG301', courseName: 'Tiếng Anh Học thuật', credits: 3, midterm: 8.0, final: 8.5, practice: null, average: 8.5, letter: 'A-', gpa: 3.7, rank: 5 },
    { courseCode: 'PHYS101', courseName: 'Vật lý Đại cương', credits: 3, midterm: 7.5, final: 7.0, practice: 8.0, average: 7.5, letter: 'B', gpa: 3.0, rank: 18 },
    { courseCode: 'HIST101', courseName: 'Lịch sử Đảng Cộng sản Việt Nam', credits: 2, midterm: 8.0, final: 8.5, practice: null, average: 8.5, letter: 'A-', gpa: 3.7, rank: 3 },
  ],
  'HK1 2025-2026': [
    { courseCode: 'CS100', courseName: 'Cơ sở lập trình', credits: 3, midterm: 9.0, final: 8.5, practice: 9.5, average: 9.0, letter: 'A', gpa: 4.0, rank: 1 },
    { courseCode: 'MATH101', courseName: 'Giải tích 1', credits: 4, midterm: 7.0, final: 7.5, practice: null, average: 7.5, letter: 'B', gpa: 3.0, rank: 15 },
    { courseCode: 'ENG201', courseName: 'Tiếng Anh Pre-Intermediate', credits: 3, midterm: 8.5, final: 8.0, practice: null, average: 8.0, letter: 'B+', gpa: 3.5, rank: 8 },
  ],
  'HK2 2024-2025': [
    { courseCode: 'MATH100', courseName: 'Đại số tuyến tính', credits: 3, midterm: 6.5, final: 7.0, practice: null, average: 7.0, letter: 'B-', gpa: 2.5, rank: 22 },
    { courseCode: 'CHEM100', courseName: 'Hóa đại cương 1', credits: 3, midterm: 8.0, final: 7.5, practice: 8.5, average: 7.8, letter: 'B+', gpa: 3.3, rank: 10 },
  ],
};

const LETTER_GRADE_COLORS: Record<string, 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
  'A': 'success', 'A-': 'success',
  'B+': 'info', 'B': 'info', 'B-': 'info',
  'C+': 'warning', 'C': 'warning',
  'D': 'error',
};

export default function PortalGradeLookup() {
  const navigate = useNavigate();
  const [semester, setSemester] = useState('HK2 2025-2026');
  const [search, setSearch] = useState('');

  const grades = GRADES[semester as keyof typeof GRADES] || [];
  const filtered = grades.filter(g =>
    !search || g.courseName.toLowerCase().includes(search.toLowerCase()) || g.courseCode.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = grades.reduce((s, g) => s + g.credits, 0);
  const avgScore = grades.length ? grades.reduce((s, g) => s + g.average, 0) / grades.length : 0;
  const totalGPA = grades.length ? grades.reduce((s, g) => s + g.gpa, 0) / grades.length : 0;

  const letterColor = (l: string) => LETTER_GRADE_COLORS[l] || 'neutral';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tra cứu điểm"
        description="Kết quả học tập theo từng học kỳ · SV: Nguyễn Văn An · MSSV: 2022-0001"
        breadcrumbs={[{ label: 'PORTAL', href: '/portal' }, { label: 'Tra cứu điểm' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/portal')}>Quay lại</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Tải bảng điểm</Button>
          </div>
        }
      />

      {/* Semester selector */}
      <div className="flex flex-wrap gap-2">
        {SEMESTERS.map((s) => (
          <button
            key={s}
            onClick={() => setSemester(s)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              semester === s
                ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] text-white'
                : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      {grades.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]"><BookOpen className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Số môn học</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{grades.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Điểm TB</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{avgScore.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]"><Star className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">GPA học kỳ</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{totalGPA.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]"><Award className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Tổng tín chỉ</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{totalCredits}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grades table */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Bảng điểm — {semester}</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm môn học..."
              className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-8 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] w-48"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {['Mã môn', 'Tên môn', 'TC', 'Giữa kỳ', 'Cuối kỳ', 'Thực hành', 'TB', 'Chữ', 'GPA', 'Xếp hạng'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Không có kết quả</td>
                </tr>
              ) : filtered.map((g) => (
                <tr key={g.courseCode} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <td className="px-4 py-3"><Badge variant="primary" size="sm">{g.courseCode}</Badge></td>
                  <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{g.courseName}</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))] text-center">{g.credits}</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))] text-center tabular-nums">{g.midterm ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))] text-center tabular-nums">{g.final ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))] text-center tabular-nums">{g.practice ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--text-primary))] text-center tabular-nums">{g.average.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center"><Badge variant={letterColor(g.letter)} size="sm">{g.letter}</Badge></td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))] text-center tabular-nums">{g.gpa.toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-muted))] text-center">#{g.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
