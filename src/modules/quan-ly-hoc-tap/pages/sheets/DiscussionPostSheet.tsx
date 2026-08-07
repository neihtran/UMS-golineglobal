import { useState, useEffect, useMemo } from 'react';
import {
  Search, RotateCcw, Eye, Edit, Trash2, Plus, Pin,
  CheckCircle, MessageSquare, Reply, BookOpen, CornerDownRight,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { FormField } from '@/components/forms';
import { usePagination } from '@/hooks';
import {
  useDiscussionPosts,
  useDiscussionPost,
  useCreateDiscussionPost,
  useUpdateDiscussionPost,
  useDeleteDiscussionPost,
  useToggleAnswer,
  useDiscussionTopics,
} from '@/hooks/useLmsPart4';
import { useLearningCourses } from '@/hooks/useLms';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDateVietnam } from '@/utils/formatters';
import type {
  DiscussionPost,
  DiscussionPostCreatePayload,
  DiscussionPostStatus,
  DiscussionPostListParams,
  DiscussionTopic,
  LearningCourse,
} from '@/types/lms.types';

const STATUS_OPTS: { value: DiscussionPostStatus; label: string; variant: 'success' | 'warning' | 'neutral' }[] = [
  { value: 'active', label: 'Hiển thị', variant: 'success' },
  { value: 'hidden', label: 'Đã ẩn', variant: 'warning' },
  { value: 'deleted', label: 'Đã xóa', variant: 'neutral' },
];

export function DiscussionPostSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;
  const notify = useNotificationStore();

  // Filters
  const [courseId, setCourseId] = useState<number | undefined>(undefined);
  const [topicId, setTopicId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<DiscussionPostStatus | ''>('');
  const [answerOnly, setAnswerOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Lookup courses
  const { data: coursesData } = useLearningCourses({ per_page: 100 });
  const courses: LearningCourse[] = Array.isArray(coursesData?.data) ? coursesData.data : [];

  useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(courses[0].id);
  }, [courses, courseId]);

  // Topics lookup for selected course
  const { data: topicsData } = useDiscussionTopics(
    courseId ? { learning_course_id: courseId, per_page: 100 } : undefined
  );
  const topics: DiscussionTopic[] = Array.isArray(topicsData?.data) ? topicsData.data : [];

  useEffect(() => {
    if (courseId && !topicId && topics.length > 0) setTopicId(topics[0].id);
    if (!courseId) setTopicId(undefined);
  }, [courseId, topics, topicId]);

  // Reset topicId when course changes
  useEffect(() => {
    setTopicId(undefined);
  }, [courseId]);

  const params: DiscussionPostListParams = useMemo(() => ({
    page,
    per_page: pageSize,
    discussion_topic_id: topicId,
    parent_post_id: null,
    status: statusFilter || undefined,
    is_answer: answerOnly ? 1 : undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  }), [page, pageSize, topicId, statusFilter, answerOnly]);

  const { data, isLoading, isFetching } = useDiscussionPosts(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [editing, setEditing] = useState<DiscussionPost | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<DiscussionPost | null>(null);

  const [form, setForm] = useState<{ content: string; status: DiscussionPostStatus }>({
    content: '',
    status: 'active',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useDiscussionPost(detailId ?? undefined);
  const createMut = useCreateDiscussionPost();
  const updateMut = useUpdateDiscussionPost();
  const deleteMut = useDeleteDiscussionPost();
  const toggleAnswerMut = useToggleAnswer();

  const selectedTopic = topics.find((t) => t.id === topicId);

  const openCreate = () => {
    setForm({ content: '', status: 'active' });
    setFormError(null);
    setCreateOpen(true);
  };

  const openEdit = (item: DiscussionPost) => {
    setEditing(item);
    setForm({ content: item.content, status: item.status ?? 'active' });
    setFormError(null);
    setEditOpen(true);
  };

  const openDetail = (item: DiscussionPost) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: DiscussionPost) => { setDeleting(item); setDeleteOpen(true); };

  const validateForm = (): boolean => {
    if (!form.content.trim()) {
      setFormError('Nội dung bài viết không được để trống');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleCreate = async () => {
    if (!topicId) return;
    if (!validateForm()) return;
    try {
      const payload: DiscussionPostCreatePayload = {
        discussion_topic_id: topicId,
        content: form.content.trim(),
        status: form.status,
      };
      await createMut.mutateAsync(payload);
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Đã đăng bài viết' });
      setCreateOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!validateForm()) return;
    try {
      await updateMut.mutateAsync({
        id: editing.id,
        payload: { content: form.content.trim(), status: form.status },
      });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật bài viết thành công' });
      setEditOpen(false);
      setEditing(null);
    } catch (err: any) {
      setFormError(err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync(deleting.id);
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Xóa bài viết thành công' });
      setDeleteOpen(false);
      setDeleting(null);
    } catch (err: any) {
      notify.addNotification({ type: 'error', title: 'Lỗi', message: err?.message || 'Xóa thất bại' });
    }
  };

  const handleToggleAnswer = async (item: DiscussionPost) => {
    try {
      await toggleAnswerMut.mutateAsync({ id: item.id, is_answer: !item.is_answer });
      notify.addNotification({
        type: 'success',
        title: 'Thành công',
        message: item.is_answer ? 'Đã bỏ đánh dấu câu trả lời' : 'Đã đánh dấu câu trả lời đúng',
      });
    } catch (err: any) {
      notify.addNotification({ type: 'error', title: 'Lỗi', message: err?.message || 'Có lỗi xảy ra' });
    }
  };

  const resetFilters = () => {
    setStatusFilter('');
    setAnswerOnly(false);
    setSearch('');
    setPage(1);
  };

  const statusBadge = (s: DiscussionPostStatus | null | undefined) =>
    STATUS_OPTS.find(o => o.value === s);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Khóa học</label>
          <select
            value={courseId ?? ''}
            onChange={(e) => { setCourseId(e.target.value ? Number(e.target.value) : undefined); setTopicId(undefined); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[200px]"
          >
            <option value="">— Chọn khóa học —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Chủ đề</label>
          <select
            value={topicId ?? ''}
            onChange={(e) => { setTopicId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            disabled={!courseId}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[220px] disabled:opacity-50"
          >
            <option value="">— Chọn chủ đề —</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.is_pinned ? '[Ghim] ' : ''}{t.is_locked ? '[Khóa] ' : ''}{t.title}
              </option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Tìm nội dung..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-56"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as DiscussionPostStatus | ''); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 h-10 px-3">
          <input
            type="checkbox"
            checked={answerOnly}
            onChange={(e) => { setAnswerOnly(e.target.checked); setPage(1); }}
            className="h-4 w-4 rounded border-[rgb(var(--border))]"
          />
          <span className="text-sm">Chỉ câu trả lời</span>
        </label>
        {(statusFilter || answerOnly || search) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}
          disabled={!topicId || selectedTopic?.is_locked}
          title={selectedTopic?.is_locked ? 'Chủ đề đã bị khóa' : undefined}>
          Đăng bài mới
        </Button>
      </div>

      {/* Selected topic info */}
      {selectedTopic && (
        <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedTopic.is_pinned && <Badge variant="warning" size="sm" className="gap-1"><Pin className="h-3 w-3" /> Ghim</Badge>}
              {selectedTopic.is_locked && <Badge variant="error" size="sm">Đã khóa</Badge>}
              <h3 className="font-bold">{selectedTopic.title}</h3>
            </div>
            {selectedTopic.description && (
              <p className="text-sm text-[rgb(var(--text-muted))] mt-1 line-clamp-2">{selectedTopic.description}</p>
            )}
          </div>
        </div>
      )}

      {!topicId ? (
        <div className="flex flex-col items-center justify-center py-12 text-[rgb(var(--text-muted))]">
          <MessageSquare className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">Vui lòng chọn khóa học và chủ đề để xem danh sách bài viết</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-14">STT</TableHeadCell>
                <TableHeadCell>Tác giả</TableHeadCell>
                <TableHeadCell>Nội dung</TableHeadCell>
                <TableHeadCell className="w-24">Reply</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell>Thời gian</TableHeadCell>
                <TableHeadCell className="text-right w-56">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton colSpan={7} rows={5} />
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                    Chưa có bài viết nào trong chủ đề này
                  </TableCell>
                </TableRow>
              ) : (
                items
                  .filter((it) => !search || it.content.toLowerCase().includes(search.toLowerCase()))
                  .map((item, i) => {
                    const sb = statusBadge(item.status);
                    return (
                      <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                        <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                          {(page - 1) * pageSize + i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-[rgb(var(--primary))]/15 flex items-center justify-center text-xs font-bold text-[rgb(var(--primary))]">
                              {item.user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                            <span className="text-sm">{item.user?.full_name ?? `User #${item.user_id ?? '?'}`}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="flex items-start gap-2">
                            {item.is_answer && (
                              <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            )}
                            <span className="line-clamp-2 text-sm">{item.content}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.replies_count > 0 ? (
                            <Badge variant="info" size="sm" className="gap-1">
                              <Reply className="h-3 w-3" />
                              {item.replies_count}
                            </Badge>
                          ) : <span className="text-[rgb(var(--text-muted))]">—</span>}
                        </TableCell>
                        <TableCell>
                          {sb && <Badge variant={sb.variant} size="sm">{sb.label}</Badge>}
                        </TableCell>
                        <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                          {item.created_at ? formatDateVietnam(item.created_at) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant={item.is_answer ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => handleToggleAnswer(item)}
                              title={item.is_answer ? 'Bỏ đánh dấu câu trả lời' : 'Đánh dấu câu trả lời'}
                              loading={toggleAnswerMut.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Sửa"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => openDelete(item)} title="Xóa"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
          <TablePagination
            page={page} pageSize={pageSize} total={total}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            pageSizeOptions={[10, 15, 25, 50]}
          />
        </>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Đăng bài viết mới"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} loading={createMut.isPending}>Đăng bài</Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{formError}</div>
          )}
          {selectedTopic && (
            <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Chủ đề</p>
              <p className="font-medium">{selectedTopic.title}</p>
            </div>
          )}
          <FormField label="Nội dung bài viết" required>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Nhập nội dung bài viết, câu hỏi hoặc chia sẻ của bạn..."
              rows={6}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30 resize-none"
            />
          </FormField>
          <FormField label="Trạng thái hiển thị">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as DiscussionPostStatus })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditing(null); }}
        title="Sửa bài viết"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditing(null); }}>Hủy</Button>
            <Button onClick={handleUpdate} loading={updateMut.isPending}>Lưu thay đổi</Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{formError}</div>
          )}
          <FormField label="Nội dung" required>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30 resize-none"
            />
          </FormField>
          <FormField label="Trạng thái hiển thị">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as DiscussionPostStatus })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết bài viết" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="h-10 w-10 rounded-full bg-[rgb(var(--primary))]/15 flex items-center justify-center font-bold text-[rgb(var(--primary))]">
                {detailData.data.user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1">
                <p className="font-bold">{detailData.data.user?.full_name ?? `User #${detailData.data.user_id ?? '?'}`}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  {detailData.data.created_at ? formatDateVietnam(detailData.data.created_at) : ''}
                </p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                {detailData.data.is_answer && (
                  <Badge variant="success" size="sm" className="gap-1">
                    <CheckCircle className="h-3 w-3" /> Câu trả lời được chấp nhận
                  </Badge>
                )}
                {detailData.data.parent_post_id && (
                  <Badge variant="neutral" size="sm" className="gap-1">
                    <CornerDownRight className="h-3 w-3" /> Reply
                  </Badge>
                )}
                {statusBadge(detailData.data.status) && (
                  <Badge variant={statusBadge(detailData.data.status)!.variant} size="sm">
                    {statusBadge(detailData.data.status)!.label}
                  </Badge>
                )}
              </div>
            </div>
            <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{detailData.data.content}</p>
            </div>
            {detailData.data.replies_count > 0 && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 inline-flex items-center gap-2">
                <Reply className="h-4 w-4 text-[rgb(var(--primary))]" />
                <span className="text-sm">Có <strong>{detailData.data.replies_count}</strong> phản hồi</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => handleToggleAnswer(detailData.data)} loading={toggleAnswerMut.isPending}>
                <CheckCircle className="h-4 w-4 mr-1" />
                {detailData.data.is_answer ? 'Bỏ đánh dấu' : 'Đánh dấu câu trả lời'}
              </Button>
              <Button onClick={() => { setDetailOpen(false); openEdit(detailData.data); }}>
                <Edit className="h-4 w-4 mr-1" /> Sửa
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>
        )}
      </Modal>

      <ConfirmModal
        open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Xác nhận xóa bài viết"
        description={`Bạn có chắc muốn xóa bài viết này?`}
        confirmText="Xóa" variant="danger" loading={deleteMut.isPending}
      />
    </div>
  );
}

export default DiscussionPostSheet;
