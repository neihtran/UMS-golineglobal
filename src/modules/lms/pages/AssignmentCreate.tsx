import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, ChevronRight, Check } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui';

const COURSES = [
  { code: 'CS101', name: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', students: 298 },
  { code: 'MATH201', name: 'Giải tích 2', instructor: 'PGS.TS. Lê Thị Lan', students: 265 },
  { code: 'ENG301', name: 'Tiếng Anh Học thuật', instructor: 'ThS. Trần Hoàng Nam', students: 240 },
  { code: 'PHYS101', name: 'Vật lý Đại cương', instructor: 'TS. Bùi Minh Tuấn', students: 198 },
  { code: 'CHEM101', name: 'Hóa học Đại cương', instructor: 'PGS.TS. Đặng Văn Minh', students: 165 },
];

const STEPS = ['Chọn khóa học', 'Thông tin bài tập', 'Nội dung & Câu hỏi', 'Cài đặt nộp'];

export default function AssignmentCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('individual');
  const [maxScore, setMaxScore] = useState('10');
  const [dueDate, setDueDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [content, setContent] = useState('');
  const [allowLate, setAllowLate] = useState(true);
  const [allowResubmit, setAllowResubmit] = useState(false);
  const [sendReminder, setSendReminder] = useState(true);
  const [autoGrade, setAutoGrade] = useState(false);

  const canNext = step === 0 ? !!selectedCourse : step === 1 ? !!title.trim() : true;

  const handlePublish = () => {
    navigate('/lms/bai-tap-sinh-vien');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo bài tập mới"
        description="LMS-01 · Phân công bài tập cho khóa học"
        breadcrumbs={[{ label: 'LMS', href: '/lms' }, { label: 'Bài tập SV', href: '/lms/bai-tap-sinh-vien' }, { label: 'Tạo bài tập' }]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/lms/bai-tap-sinh-vien')}>
            Quay lại
          </Button>
        }
      />

      {/* Step indicator */}
      <div className="flex items-center gap-0 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center min-w-0">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                i === step
                  ? 'text-[rgb(var(--primary))] border-b-2 border-[rgb(var(--primary))]'
                  : i < step
                  ? 'text-[rgb(var(--success))] border-b-2 border-[rgb(var(--success))] cursor-pointer'
                  : 'text-[rgb(var(--text-muted))] border-b-2 border-transparent'
              }`}
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i < step ? 'bg-[rgb(var(--success))] text-white' :
                i === step ? 'bg-[rgb(var(--primary))] text-white' :
                'bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {s}
            </button>
            {i < STEPS.length - 1 && <div className="h-px flex-1 min-w-4 bg-[rgb(var(--border))]" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">

          {/* Step 0: Chọn khóa học */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-1">Chọn khóa học</h3>
                <p className="text-sm text-[rgb(var(--text-muted))]">Chọn khóa học mà bạn muốn giao bài tập này</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {COURSES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCourse(c)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      selectedCourse?.code === c.code
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)] ring-1 ring-[rgb(var(--primary))]'
                        : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] hover:border-[rgb(var(--primary)/0.4)]'
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      selectedCourse?.code === c.code
                        ? 'bg-[rgb(var(--primary))] text-white'
                        : 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]'
                    }`}>
                      {c.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{c.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{c.instructor} · {c.students} sinh viên</p>
                    </div>
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selectedCourse?.code === c.code
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]'
                        : 'border-[rgb(var(--border))]'
                    }`}>
                      {selectedCourse?.code === c.code && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Thông tin bài tập */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-1">Thông tin bài tập</h3>
                <p className="text-sm text-[rgb(var(--text-muted))]">
                  Khóa: <span className="text-[rgb(var(--primary))] font-medium">{selectedCourse?.name}</span>
                </p>
              </div>
              <FormField label="Tiêu đề bài tập" required>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Bài tập tuần 8 — Vòng lặp" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Loại bài tập" required>
                  <select value={type} onChange={(e) => setType(e.target.value)}
                    className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-full">
                    <option value="individual">Cá nhân</option>
                    <option value="group">Nhóm</option>
                  </select>
                </FormField>
                <FormField label="Điểm tối đa" required>
                  <Input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} placeholder="10" />
                </FormField>
              </div>
              <FormField label="Hạn nộp" required>
                <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full" />
              </FormField>
              <FormField label="Mô tả / Hướng dẫn">
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Mô tả chi tiết bài tập, yêu cầu đầu ra, tiêu chí chấm điểm..."
                  rows={5}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] resize-none"
                />
              </FormField>
            </div>
          )}

          {/* Step 2: Nội dung */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-1">Nội dung & Câu hỏi</h3>
                <p className="text-sm text-[rgb(var(--text-muted))]">Nhập nội dung câu hỏi hoặc đính kèm file tài liệu</p>
              </div>
              <FormField label="Câu hỏi / Đề bài">
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập đề bài, câu hỏi (hỗ trợ Markdown)..."
                  rows={10}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] resize-none font-mono"
                />
              </FormField>
              <div className="flex items-center justify-center border-2 border-dashed border-[rgb(var(--border))] rounded-xl p-8 cursor-pointer hover:border-[rgb(var(--primary-light))] transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-[rgb(var(--text-muted))] mx-auto mb-2" />
                  <p className="text-sm text-[rgb(var(--text-secondary))]">Kéo thả file hoặc nhấn để chọn</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">PDF, DOCX, ZIP — tối đa 50MB</p>
                  <Button variant="outline" size="sm" className="mt-3">Chọn file đính kèm</Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Cài đặt */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-1">Cài đặt nộp bài</h3>
                <p className="text-sm text-[rgb(var(--text-muted))]">Cấu hình các tùy chọn khi sinh viên nộp bài</p>
              </div>
              {[
                { label: 'Cho phép nộp trễ', checked: allowLate, set: setAllowLate, desc: 'Sinh viên có thể nộp sau ngày hết hạn với điểm trừ' },
                { label: 'Cho phép nộp lại', checked: allowResubmit, set: setAllowResubmit, desc: 'Sinh viên có thể nộp bài nhiều lần trước hạn' },
                { label: 'Gửi thông báo nhắc hạn', checked: sendReminder, set: setSendReminder, desc: 'Tự động gửi email nhắc nhở trước 24h' },
                { label: 'Chấm điểm tự động', checked: autoGrade, set: setAutoGrade, desc: 'Chấm tự động nếu đáp án đúng/sai' },
              ].map(({ label, checked, set, desc }) => (
                <label key={label} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary-light))/0.3]" />
                  <div>
                    <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{label}</span>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}

              {/* Summary */}
              <div className="rounded-xl border border-[rgb(var(--primary)/0.2)] bg-[rgb(var(--primary)/0.04)] p-4 space-y-2">
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Tóm tắt bài tập</p>
                {[
                  ['Khóa học', selectedCourse?.name],
                  ['Tiêu đề', title],
                  ['Loại', type === 'group' ? 'Nhóm' : 'Cá nhân'],
                  ['Điểm tối đa', maxScore],
                  ['Hạn nộp', dueDate ? new Date(dueDate).toLocaleString('vi-VN') : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--text-muted))]">{k}</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-[rgb(var(--border)/0.6)]">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              ← Quay lại
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext} rightIcon={<ChevronRight className="h-4 w-4" />}>
                Tiếp tục
              </Button>
            ) : (
              <Button leftIcon={<Save className="h-4 w-4" />} onClick={handlePublish}>
                Xuất bản bài tập
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
