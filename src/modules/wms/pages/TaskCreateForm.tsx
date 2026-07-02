import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  module: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'pending_approval', 'done']),
  assignee: z.string().min(1),
  dept: z.string().min(1),
  dueDate: z.string().min(1),
  progress: z.coerce.number().min(0).max(100).default(0),
});

type FormValues = z.infer<typeof taskSchema>;

const MODULE_OPTIONS = [
  'IAM', 'HRM', 'SIS', 'FIN', 'LMS', 'EXAM',
  'DMS', 'OCR', 'PORTAL', 'WMS', 'KTX', 'INT',
  'BI', 'DCE', 'PMS', 'RIT',
];

const selectCls = 'h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]';

export default function TaskCreateForm() {
  const { t } = useTranslation('wms');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      module: '',
      priority: 'medium',
      status: 'todo',
      assignee: '',
      dept: '',
      dueDate: '',
      progress: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    console.log('Create task:', data);
    reset();
    navigate('/wms/cong-viec');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('createTask.title')}
        description={t('createTask.subtitle')}
        breadcrumbs={[
          { label: 'WMS', href: '/wms' },
          { label: t('createTask.title') },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t('createTask.cancel')}
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('createTask.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label={t('createTask.form.title')} required error={errors.title?.message}>
              <Input {...register('title')} placeholder={t('createTask.form.title')} />
            </FormField>

            <FormField label={t('createTask.form.description')} required error={errors.description?.message}>
              <Textarea
                {...register('description')}
                placeholder={t('createTask.form.descriptionPlaceholder')}
                rows={4}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('createTask.form.module')} required error={errors.module?.message}>
                <select {...register('module')} className={selectCls}>
                  <option value="">{t('createTask.form.selectModule')}</option>
                  {MODULE_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </FormField>

              <FormField label={t('createTask.form.priority')} required error={errors.priority?.message}>
                <select {...register('priority')} className={selectCls}>
                  <option value="low">{t('task.priority.low')}</option>
                  <option value="medium">{t('task.priority.medium')}</option>
                  <option value="high">{t('task.priority.high')}</option>
                  <option value="urgent">{t('task.priority.urgent')}</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('createTask.form.status')} error={errors.status?.message}>
                <select {...register('status')} className={selectCls}>
                  <option value="todo">{t('task.status.todo')}</option>
                  <option value="in_progress">{t('task.status.in_progress')}</option>
                  <option value="pending_approval">{t('task.status.pending_approval')}</option>
                  <option value="done">{t('task.status.done')}</option>
                </select>
              </FormField>

              <FormField label={t('createTask.form.progress')} error={errors.progress?.message}>
                <Input type="number" min={0} max={100} {...register('progress')} placeholder="0" />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('createTask.assignment')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('createTask.form.assignee')} required error={errors.assignee?.message}>
                <Input {...register('assignee')} placeholder={t('createTask.form.assigneePlaceholder')} />
              </FormField>

              <FormField label={t('createTask.form.dept')} required error={errors.dept?.message}>
                <Input {...register('dept')} placeholder={t('createTask.form.deptPlaceholder')} />
              </FormField>
            </div>

            <FormField label={t('createTask.form.dueDate')} required error={errors.dueDate?.message}>
              <Input type="date" {...register('dueDate')} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('createTask.subtasks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[rgb(var(--text-muted))] mb-3">
              {t('createTask.subtasksDesc')}
            </p>
            <SubtaskInput t={t} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/wms/cong-viec')}>
            {t('createTask.cancel')}
          </Button>
          <Button type="submit" loading={isSubmitting} leftIcon={<Plus className="h-4 w-4" />}>
            {t('createTask.createBtn')}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SubtaskInput({ t }: { t: ReturnType<typeof useTranslation>['t'] }) {
  const [items, setItems] = useState<string[]>([]);
  const [value, setValue] = useState('');

  const add = () => {
    const trimmed = value.trim();
    if (trimmed) {
      setItems((prev) => [...prev, trimmed]);
      setValue('');
    }
  };

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))]" />
          <span className="flex-1 text-sm text-[rgb(var(--text-primary))]">{item}</span>
          <button type="button" onClick={() => remove(idx)} className="text-[rgb(var(--text-muted))] hover:text-red-500 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('createTask.form.subtaskPlaceholder')}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          {t('createTask.addSubtask')}
        </Button>
      </div>
    </div>
  );
}
