// ─── LMS Part 4: Discussion Hooks ────────────────────────────────────────────────
// TanStack Query hooks for Discussion Topics & Posts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { discussionPostsApi, discussionTopicsApi } from '@/services/lmsApi';
import type {
  DiscussionPostCreatePayload,
  DiscussionPostListParams,
  DiscussionPostUpdatePayload,
  DiscussionTopicCreatePayload,
  DiscussionTopicListParams,
  DiscussionTopicUpdatePayload,
} from '@/types/lms.types';

// ─── Query Keys ─────────────────────────────────────────────────────────────────
export const LMS_DISCUSSION_QUERY_KEYS = {
  topics: {
    all: ['lms', 'discussion-topics'] as const,
    list: (params?: DiscussionTopicListParams) =>
      ['lms', 'discussion-topics', 'list', params ?? {}] as const,
    detail: (id: number) => ['lms', 'discussion-topics', 'detail', id] as const,
  },
  posts: {
    all: ['lms', 'discussion-posts'] as const,
    list: (params?: DiscussionPostListParams) =>
      ['lms', 'discussion-posts', 'list', params ?? {}] as const,
    detail: (id: number) => ['lms', 'discussion-posts', 'detail', id] as const,
  },
};

// ─── DiscussionTopics ────────────────────────────────────────────────────────────
export const useDiscussionTopics = (params?: DiscussionTopicListParams) =>
  useQuery({
    queryKey: LMS_DISCUSSION_QUERY_KEYS.topics.list(params),
    queryFn: async () => (await discussionTopicsApi.list(params)).data,
    enabled: !!params?.learning_course_id,
  });

export const useDiscussionTopic = (id?: number | string) =>
  useQuery({
    queryKey: LMS_DISCUSSION_QUERY_KEYS.topics.detail(Number(id)),
    queryFn: async () => (await discussionTopicsApi.get(id!)).data,
    enabled: !!id,
  });

export const useCreateDiscussionTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DiscussionTopicCreatePayload) =>
      discussionTopicsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.topics.all });
    },
  });
};

export const useUpdateDiscussionTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DiscussionTopicUpdatePayload }) =>
      discussionTopicsApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.topics.all });
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.topics.detail(vars.id) });
    },
  });
};

export const useDeleteDiscussionTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => discussionTopicsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.topics.all });
    },
  });
};

// ─── DiscussionPosts ─────────────────────────────────────────────────────────────
export const useDiscussionPosts = (params?: DiscussionPostListParams) =>
  useQuery({
    queryKey: LMS_DISCUSSION_QUERY_KEYS.posts.list(params),
    queryFn: async () => (await discussionPostsApi.list(params)).data,
    enabled: !!params?.discussion_topic_id,
  });

export const useDiscussionPost = (id?: number | string) =>
  useQuery({
    queryKey: LMS_DISCUSSION_QUERY_KEYS.posts.detail(Number(id)),
    queryFn: async () => (await discussionPostsApi.get(id!)).data,
    enabled: !!id,
  });

export const useCreateDiscussionPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DiscussionPostCreatePayload) => discussionPostsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.posts.all });
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.topics.all });
    },
  });
};

export const useUpdateDiscussionPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DiscussionPostUpdatePayload }) =>
      discussionPostsApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.posts.all });
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.posts.detail(vars.id) });
    },
  });
};

export const useDeleteDiscussionPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => discussionPostsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.posts.all });
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.topics.all });
    },
  });
};

export const useToggleAnswer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_answer }: { id: number; is_answer: boolean }) =>
      discussionPostsApi.toggleAnswer(id, is_answer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_DISCUSSION_QUERY_KEYS.posts.all });
    },
  });
};
