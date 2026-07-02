import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Upload, Check, FileText, BookOpen, Video, FileArchive } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const COURSES = [
  { code: 'CS101', name: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh' },
  { code: 'MATH201', name: 'Giải tích 2', instructor: 'PGS.TS. Lê Thị Lan' },
  { code: 'ENG301', name: 'Tiếng Anh Học thuật', instructor: 'ThS. Trần Hoàng Nam' },
  { code: 'PHYS101', name: 'Vật lý Đại cương', instructor: 'TS. Bùi Minh Tuấn' },
  { code: 'CHEM101', name: 'Hóa học Đại cương', instructor: 'PGS.TS. Đặng Văn Minh' },
];

const TOPICS = [
  'Giáo trình', 'Bài giảng', 'Bài tập', 'Tài liệu tham khảo', 'Đề thi', 'Video bài giảng',
];

const TYPE_OPTIONS = [
  { id: 'video', label: 'Video bài giảng', icon: <Video className="h-5 w-5" />, color: 'error', accept: '.mp4,.mov,.avi,.mkv', maxSize: '2 GB' },
  { id: 'pdf', label: 'Tài liệu PDF', icon: <FileText className="h-5 w-5" />, color: 'accent', accept: '.pdf', maxSize: '100 MB' },
  { id: 'document', label: 'Tài liệu', icon: <BookOpen className="h-5 w-5" />, color: 'info', accept: '.docx,.doc,.pptx', maxSize: '50 MB' },
  { id: 'zip', label: 'File nén', icon: <FileArchive className="h-5 w-5" />, color: 'warning', accept: '.zip,.rar,.7z', maxSize: '500 MB' },
];

const STEPS = ['Chọn loại & Khóa học', 'Thông tin học liệu', 'Tải lên nội dung', 'Hoàn tất'];

export default function MaterialUploadPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Mock data for edit mode
  const EDIT_DATA = {
    m1: { typeId: 'video', courseCode: 'CS101', title: 'Bài giảng tuần 1 — Giới thiệu Python', description: 'Bài giảng giới thiệu tổng quan về ngôn ngữ lập trình Python cho người mới bắt đầu.', topics: ['Bài giảng'], tags: ['python', 'giới thiệu'], status: 'published', files: [{ name: 'bai_giang_tuan1.mp4', size: '320 MB', progress: 100 }] },
    m2: { typeId: 'pdf', courseCode: 'CS101', title: 'Slide bài giảng Chương 2 — Biến & Kiểu dữ liệu', description: '', topics: ['Bài giảng'], tags: ['python', 'biến'], status: 'published', files: [{ name: 'slide_chuong2.pdf', size: '5.2 MB', progress: 100 }] },
    m3: { typeId: 'document', courseCode: 'CS101', title: 'Tài liệu tham khảo — Python for Everybody', description: '', topics: ['Tài liệu tham khảo'], tags: ['python', 'tài liệu'], status: 'published', files: [] },
    m4: { typeId: 'video', courseCode: 'CS101', title: 'Video thực hành — Cài đặt môi trường', description: '', topics: ['Bài tập'], tags: ['python', 'thực hành'], status: 'published', files: [] },
    m5: { typeId: 'zip', courseCode: 'CS101', title: 'Bài tập thực hành tuần 3', description: '', topics: ['Bài tập'], tags: ['python', 'bài tập'], status: 'published', files: [] },
    m6: { typeId: 'pdf', courseCode: 'CS101', title: 'Đề cương môn học HK1 2026-2027', description: '', topics: ['Giáo trình'], tags: ['đề cương'], status: 'published', files: [] },
    m7: { typeId: 'video', courseCode: 'CS101', title: 'Bài giảng tuần 2 — Vòng lặp & Hàm', description: '', topics: ['Bài giảng'], tags: ['python', 'vòng lặp'], status: 'draft', files: [] },
    m8: { typeId: 'pdf', courseCode: 'MATH201', title: 'Tổng hợp công thức Toán cao cấp', description: '', topics: ['Tài liệu tham khảo'], tags: ['toán', 'công thức'], status: 'published', files: [] },
  };

  const editData = isEditMode ? EDIT_DATA[id as keyof typeof EDIT_DATA] : null;
  const [step, setStep] = useState(isEditMode ? 1 : 0);
  const [selectedType, setSelectedType] = useState<typeof TYPE_OPTIONS[0] | null>(
    isEditMode && editData ? TYPE_OPTIONS.find(t => t.id === editData.typeId) ?? null : null
  );
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(
    isEditMode && editData ? COURSES.find(c => c.code === editData.courseCode) ?? null : null
  );
  const [title, setTitle] = useState(isEditMode && editData ? editData.title : '');
  const [description, setDescription] = useState(isEditMode && editData ? editData.description : '');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(isEditMode && editData ? editData.topics : []);
  const [tags, setTags] = useState<string[]>(isEditMode && editData ? editData.tags : ['python', 'vòng lặp']);
  const [tagInput, setTagInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; progress: number }>>(
    isEditMode && editData ? editData.files : []
  );
  const [published, setPublished] = useState(false);

  const canNext = step === 0 ? !!selectedType && !!selectedCourse : step === 1 ? !!title.trim() : step === 2 ? uploadedFiles.length > 0 : true;

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase()) && tags.length < 10) {
        setTags((prev) => [...prev, tagInput.trim().toLowerCase()]);
      }
      setTagInput('');
    }
  };

  const handlePublish = () => {
    setPublished(true);
    setStep(3);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Chỉnh sửa học liệu' : 'Thêm học liệu'}
        description={isEditMode ? `LMS-01 · Chỉ�nh sửa học liệu` : 'LMS-01 · Đăng tải tài liệu lên thư viện'}
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Thư viện học liệu', href: '/lms/thu-vien-hoc-lieu' },
          ...(isEditMode ? [{ label: title || 'Chỉnh sửa' }] : [{ label: 'Thêm học liệu' }]),
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/lms/thu-vien-hoc-lieu')}>
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
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className="h-px flex-1 min-w-4 bg-[rgb(var(--border))]" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">

          {/* ── Step 0: Chọn loại & Khóa học ──────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-1">Chọn loại học liệu</h3>
                <p className="text-sm text-[rgb(var(--text-muted))]">Chọn định dạng tài liệu bạn muốn đăng tải</p>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                      selectedType?.id === t.id
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)] ring-1 ring-[rgb(var(--primary))]'
                        : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] hover:border-[rgb(var(--primary)/0.4)]'
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      selectedType?.id === t.id
                        ? 'bg-[rgb(var(--primary))] text-white'
                        : `bg-[rgb(var(--${t.color})/0.1)] text-[rgb(var(--${t.color}))]`
                    }`}>
                      {t.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t.label}</p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">Tối đa {t.maxSize}</p>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 ${
                      selectedType?.id === t.id
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]'
                        : 'border-[rgb(var(--border))]'
                    }`}>
                      {selectedType?.id === t.id && <Check className="h-3 w-3 text-white mx-auto" />}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-1">Chọn khóa học</h3>
                <p className="text-sm text-[rgb(var(--text-muted))]">Học liệu sẽ được gắn với khóa học được chọn</p>
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
                      <p className="text-xs text-[rgb(var(--text-muted))]">{c.instructor}</p>
                    </div>
                    <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
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

          {/* ── Step 1: Thông tin học liệu ───────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-1">Thông tin học liệu</h3>
                <p className="text-sm text-[rgb(var(--text-muted))]">
                  Khóa: <span className="text-[rgb(var(--primary))] font-medium">{selectedCourse?.name}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Tiêu đề <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Bài giảng tuần 8 — Vòng lặp trong Python"
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-[rgb(var(--primary-light)/0.3)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn gọn nội dung học liệu..."
                  rows={4}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-[rgb(var(--primary-light)/0.3)] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Chủ đề
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTopic(t)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        selectedTopics.includes(t)
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]'
                          : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.4)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Nhãn (Tags)
                </label>
                <div className="flex flex-wrap items-center gap-2 min-h-[42px] p-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))] text-xs font-medium">
                      #{tag}
                      <button onClick={() => setTags((prev) => prev.filter((t) => t !== tag))} className="hover:text-[rgb(var(--error))]">
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={tags.length === 0 ? 'Nhập tag, nhấn Enter...' : ''}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-[rgb(var(--text-muted))] mt-1">{tags.length}/10 tags</p>
              </div>
            </div>
          )}

          {/* ── Step 2: Tải lên nội dung ────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-1">Tải lên nội dung</h3>
                <p className="text-sm text-[rgb(var(--text-muted))]">
                  {selectedType && <>Định dạng: <span className="font-medium text-[rgb(var(--text-primary))]">{selectedType.accept}</span> · Tối đa {selectedType.maxSize}</>}
                </p>
              </div>

              {/* Drop zone */}
              <div className="flex items-center justify-center border-2 border-dashed border-[rgb(var(--border))] rounded-xl p-12 cursor-pointer hover:border-[rgb(var(--primary-light))] transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onClick={() => {
                  const file = { name: selectedType?.id === 'video' ? 'bai_giang_tuan8.mp4' : 'tai_lieu_tuan8.pdf', size: selectedType?.id === 'video' ? '320 MB' : '5.2 MB', progress: 100 };
                  if (!uploadedFiles.find(f => f.name === file.name)) {
                    setUploadedFiles((prev) => [...prev, file]);
                  }
                }}>
                <div className="text-center">
                  {selectedType ? (
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-4 bg-[rgb(var(--${selectedType.color})/0.1)] text-[rgb(var(--${selectedType.color}))]`}>
                      {selectedType.icon}
                    </div>
                  ) : (
                    <Upload className="h-16 w-16 text-[rgb(var(--text-muted))] mx-auto mb-4" />
                  )}
                  <p className="text-base font-semibold text-[rgb(var(--text-primary))]">Kéo thả file vào đây</p>
                  <p className="text-sm text-[rgb(var(--text-muted))] mt-1">hoặc nhấn để chọn file</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
                    {selectedType ? `Hỗ trợ: ${selectedType.accept}` : 'Chọn loại học liệu ở bước 1 trước'}
                  </p>
                </div>
              </div>

              {/* Uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">File đã tải lên ({uploadedFiles.length})</p>
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--border)/0.5)] bg-[rgb(var(--bg-base))]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">{f.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                            <div className="h-full rounded-full bg-[rgb(var(--success))]" style={{ width: `${f.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-[rgb(var(--text-muted))]">{f.progress === 100 ? '✓ Hoàn tất' : `${f.progress}%`}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--error))] text-sm"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Hoàn tất ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="text-center py-8 space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--success)/0.1)] mx-auto">
                <Check className="h-10 w-10 text-[rgb(var(--success))]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                  {published ? 'Học liệu đã được xuất bản!' : 'Học liệu đã được lưu nháp!'}
                </h3>
                <p className="text-sm text-[rgb(var(--text-muted))] mt-2">
                  Học liệu <span className="font-semibold text-[rgb(var(--text-primary))]">{title || 'Bài giảng tuần 8'}</span> đã sẵn sàng.
                </p>
              </div>
              <div className="flex justify-center gap-3 mt-4">
                <Button variant="outline" onClick={() => { setPublished(false); setStep(0); }}>
                  Tải lên thêm
                </Button>
                <Button onClick={() => navigate('/lms/thu-vien-hoc-lieu')}>
                  Xem thư viện học liệu
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex justify-between pt-4 border-t border-[rgb(var(--border)/0.6)]">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Quay lại
              </Button>
              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext} rightIcon={<ChevronRight className="h-4 w-4" />}>
                  Tiếp tục
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setStep(3); setPublished(false); }}>
                    Lưu nháp
                  </Button>
                  <Button leftIcon={<Check className="h-4 w-4" />} onClick={handlePublish}>
                    Xuất bản
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
