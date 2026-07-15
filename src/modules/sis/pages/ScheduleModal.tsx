import { useState } from 'react';
import { Modal, Button, Input, Select, FormField } from '@/components/ui';

interface Schedule {
  _id: string;
  course: { name: string; code: string };
  lecturer: { name: string; code: string };
  room?: { name: string; code: string };
  dayOfWeek: number;
  lessonFrom: number;
  lessonTo: number;
  startDate?: string;
  endDate?: string;
  note?: string;
  isActive: boolean;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  data?: Schedule;
}

const DAY_OPTIONS = [
  { value: '2', label: 'Thứ 2' },
  { value: '3', label: 'Thứ 3' },
  { value: '4', label: 'Thứ 4' },
  { value: '5', label: 'Thứ 5' },
  { value: '6', label: 'Thứ 6' },
  { value: '7', label: 'Thứ 7' },
  { value: '1', label: 'Chủ nhật' },
];

const LESSON_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `Tiết ${i + 1}`,
}));

const COURSE_OPTIONS = [
  { value: 'MATH101', label: 'Toán cao cấp A1' },
  { value: 'PHY101', label: 'Vật lý đại cương' },
  { value: 'CS101', label: 'Lập trình C++' },
  { value: 'ENG101', label: 'Tiếng Anh A1' },
];

const LECTURER_OPTIONS = [
  { value: 'GV001', label: 'Nguyễn Văn A' },
  { value: 'GV002', label: 'Trần Thị B' },
  { value: 'GV003', label: 'Lê Văn C' },
  { value: 'GV004', label: 'Phạm Thị D' },
];

export function ScheduleModal({ isOpen, onClose, mode, data }: ScheduleModalProps) {
  const isView = mode === 'view';
  const [formData, setFormData] = useState({
    course: data?.course?.code || '',
    lecturer: data?.lecturer?.code || '',
    room: data?.room?.code || '',
    dayOfWeek: data?.dayOfWeek || 2,
    lessonFrom: data?.lessonFrom || 1,
    lessonTo: data?.lessonTo || 3,
    note: data?.note || '',
  });

  const config = {
    create: { title: 'Thêm lịch học', submit: 'Tạo mới' },
    edit: { title: 'Sửa lịch học', submit: 'Lưu thay đổi' },
    view: { title: 'Chi tiết lịch học', submit: null },
  };

  const handleSubmit = () => {
    console.log('Submit:', formData);
    onClose();
  };

  const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config[mode].title}
      size="lg"
      footer={
        config[mode].submit ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>{config[mode].submit}</Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Môn học">
            {isView ? (
              <div>{data?.course?.name}</div>
            ) : (
              <Select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                options={COURSE_OPTIONS}
                placeholder="Chọn môn học"
              />
            )}
          </FormField>

          <FormField label="Giảng viên">
            {isView ? (
              <div>{data?.lecturer?.name}</div>
            ) : (
              <Select
                value={formData.lecturer}
                onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                options={LECTURER_OPTIONS}
                placeholder="Chọn giảng viên"
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Ngày trong tuần">
            {isView ? (
              <div>{DAY_LABELS[data?.dayOfWeek! - 1]}</div>
            ) : (
              <Select
                value={formData.dayOfWeek}
                onChange={(e) =>
                  setFormData({ ...formData, dayOfWeek: Number(e.target.value) })
                }
                options={DAY_OPTIONS}
              />
            )}
          </FormField>

          <FormField label="Tiết bắt đầu">
            {isView ? (
              <div>Tiết {data?.lessonFrom}</div>
            ) : (
              <Select
                value={formData.lessonFrom}
                onChange={(e) =>
                  setFormData({ ...formData, lessonFrom: Number(e.target.value) })
                }
                options={LESSON_OPTIONS}
              />
            )}
          </FormField>

          <FormField label="Tiết kết thúc">
            {isView ? (
              <div>Tiết {data?.lessonTo}</div>
            ) : (
              <Select
                value={formData.lessonTo}
                onChange={(e) =>
                  setFormData({ ...formData, lessonTo: Number(e.target.value) })
                }
                options={LESSON_OPTIONS}
              />
            )}
          </FormField>
        </div>

        <FormField label="Phòng học">
          {isView ? (
            <div>{data?.room?.name || '—'}</div>
          ) : (
            <Input
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="VD: A101"
            />
          )}
        </FormField>

        <FormField label="Ghi chú">
          {isView ? (
            <div>{data?.note || '—'}</div>
          ) : (
            <Input
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="VD: Tuần lẻ"
            />
          )}
        </FormField>
      </div>
    </Modal>
  );
}
