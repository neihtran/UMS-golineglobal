import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui';

const STEPS = ['Thông tin bài tập', 'Nội dung & câu hỏi', 'Cài đặt nộp'];

export default function CreateAssignment() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('individual');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('10');
  const [instructions, setInstructions] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo bài tập mới"
        description="LMS-01 · Tạo bài tập cho khóa học"
        breadcrumbs={[{ label: 'LMS', href: '/lms' }, { label: 'Khóa học', href: '/lms/khoa-hoc' }, { label: 'Tạo bài tập' }]}
        actions={
          <Link to="/lms/khoa-hoc">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>Quay lại</Button>
          </Link>
        }
      />

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                i === step
                  ? 'text-[rgb(var(--primary))] border-b-2 border-[rgb(var(--primary))]'
                  : i < step
                  ? 'text-[rgb(var(--success))] border-b-2 border-[rgb(var(--success))]'
                  : 'text-[rgb(var(--text-muted))] border-b-2 border-transparent'
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i < step ? 'bg-[rgb(var(--success))] text-white' :
                i === step ? 'bg-[rgb(var(--primary))] text-white' :
                'bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {s}
            </button>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[rgb(var(--border))]" />}
          </React.Fragment>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Step 0: Basic info */}
          {step === 0 && (
            <div className="space-y-5">
              <FormField label="Tiêu đề bài tập" required>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Bài tập tuần 8 — Vòng lặp" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Loại bài tập" required>
                  <select value={type} onChange={(e) => setType(e.target.value)}
                    className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-full">
                    <option value="individual">Cá nhân</option>
                    <option value="group">Nhóm</option>
                  </select>
                </FormField>
                <FormField label="Điểm tối đa" required>
                  <Input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} placeholder="10" />
                </FormField>
              </div>
              <FormField label="Hạn nộp" required>
                <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </FormField>
              <FormField label="Mô tả / hướng dẫn">
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Mô tả chi tiết bài tập, yêu cầu đầu ra..."
                  rows={5}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] resize-none"
                />
              </FormField>
            </div>
          )}

          {/* Step 1: Content */}
          {step === 1 && (
            <div className="space-y-5">
              <FormField label="Nội dung câu hỏi">
                <textarea placeholder="Nhập nội dung câu hỏi, có thể dùng Markdown..."
                  rows={10}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] resize-none font-mono"
                />
              </FormField>
              <div className="flex items-center justify-center border-2 border-dashed border-[rgb(var(--border))] rounded-lg p-8 cursor-pointer hover:border-[rgb(var(--primary-light))] transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-[rgb(var(--text-muted))] mx-auto mb-2" />
                  <p className="text-sm text-[rgb(var(--text-secondary))]">Kéo thả file hoặc</p>
                  <Button variant="outline" size="sm" className="mt-2">Chọn file đính kèm</Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="space-y-5">
              {[
                { label: 'Cho phép nộp trễ', defaultChecked: true },
                { label: 'Cho phép nộp lại', defaultChecked: false },
                { label: 'Gửi thông báo nhắc hạn', defaultChecked: true },
                { label: 'Chấm điểm tự động (nếu có)', defaultChecked: false },
              ].map(({ label, defaultChecked }) => (
                <label key={label} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked={defaultChecked}
                    className="h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary-light))/0.3]" />
                  <span className="text-sm text-[rgb(var(--text-primary))]">{label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-[rgb(var(--border)/0.6)]">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              ← Quay lại
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => Math.min(2, s + 1))}>
                Tiếp tục →
              </Button>
            ) : (
              <Button leftIcon={<Save className="h-4 w-4" />}>
                Xuất bản bài tập
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
