/**
 * usePms — TanStack Query hooks for PMS (Party Management) module.
 *
 * NOTE: PMS data is strictly confidential. This module uses isolated authentication.
 * Do NOT connect to the regular notificationStore for PMS operations.
 * All notifications should use PMS-specific auth context.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  partyMemberService,
  activityService,
  pmsTrainingService,
} from '@/services/pms.service';
import type {
  PartyMemberFilters,
  PartyMember,
  ActivityFilters,
  Activity,
  PMSTrainingFilters,
  PMSTraining,
} from '@/services/pms.service';

// ─── Party Members ──────────────────────────────────────────────────────────────

export const usePartyMemberList = (filters: PartyMemberFilters) =>
  useQuery({
    queryKey: ['pms', 'party-members', 'list', filters],
    queryFn: () => partyMemberService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const usePartyMemberDetail = (id: string) =>
  useQuery({
    queryKey: ['pms', 'party-members', id],
    queryFn: () => partyMemberService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const usePartyMemberProfile = (id: string) =>
  useQuery({
    queryKey: ['pms', 'party-members', id, 'profile'],
    queryFn: () => partyMemberService.getProfile(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreatePartyMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: partyMemberService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pms', 'party-members'] });
    },
  });
};

export const useUpdatePartyMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PartyMember> }) =>
      partyMemberService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'party-members'] });
      qc.setQueryData(['pms', 'party-members', vars.id], result.data);
    },
  });
};

export const useDeletePartyMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: partyMemberService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pms', 'party-members'] });
    },
  });
};

export const useTransferPartyMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, toBranchId, reason }: { id: string; toBranchId: string; reason: string }) =>
      partyMemberService.transfer(id, toBranchId, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'party-members'] });
      qc.setQueryData(['pms', 'party-members', vars.id], result.data);
    },
  });
};

export const useChangePartyMemberStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, partyStatus, reason }: { id: string; partyStatus: string; reason?: string }) =>
      partyMemberService.changeStatus(id, partyStatus, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'party-members'] });
      qc.setQueryData(['pms', 'party-members', vars.id], result.data);
    },
  });
};

export const usePromotePartyMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPosition, effectiveDate }: { id: string; newPosition: string; effectiveDate: string }) =>
      partyMemberService.promote(id, newPosition, effectiveDate),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'party-members'] });
      qc.setQueryData(['pms', 'party-members', vars.id], result.data);
    },
  });
};

export const useSuspendPartyMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, durationMonths }: { id: string; reason: string; durationMonths?: number }) =>
      partyMemberService.suspend(id, reason, durationMonths),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'party-members'] });
      qc.setQueryData(['pms', 'party-members', vars.id], result.data);
    },
  });
};

// ─── Activities ─────────────────────────────────────────────────────────────────

export const useActivityList = (filters: ActivityFilters) =>
  useQuery({
    queryKey: ['pms', 'activities', 'list', filters],
    queryFn: () => activityService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useActivityDetail = (id: string) =>
  useQuery({
    queryKey: ['pms', 'activities', id],
    queryFn: () => activityService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useActivityParticipants = (id: string) =>
  useQuery({
    queryKey: ['pms', 'activities', id, 'participants'],
    queryFn: () => activityService.getParticipants(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useActivityAttendance = (id: string) =>
  useQuery({
    queryKey: ['pms', 'activities', id, 'attendance'],
    queryFn: () => activityService.getAttendance(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activityService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pms', 'activities'] });
    },
  });
};

export const useUpdateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) =>
      activityService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'activities'] });
      qc.setQueryData(['pms', 'activities', vars.id], result.data);
    },
  });
};

export const useDeleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activityService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pms', 'activities'] });
    },
  });
};

export const useRegisterActivityParticipant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, memberId }: { id: string; memberId: string }) =>
      activityService.register(id, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pms', 'activities'] });
    },
  });
};

export const useTakeActivityAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attendance }: { id: string; attendance: { memberId: string; present: boolean; note?: string }[] }) =>
      activityService.takeAttendance(id, attendance),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'activities'] });
      qc.setQueryData(['pms', 'activities', vars.id], result.data);
    },
  });
};

export const useStartActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activityService.start,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['pms', 'activities'] });
      qc.setQueryData(['pms', 'activities', id], result.data);
    },
  });
};

export const useCompleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { resolution?: string; attachmentUrls?: string[] } }) =>
      activityService.complete(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'activities'] });
      qc.setQueryData(['pms', 'activities', vars.id], result.data);
    },
  });
};

export const useCancelActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      activityService.cancel(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'activities'] });
      qc.setQueryData(['pms', 'activities', vars.id], result.data);
    },
  });
};

// ─── Trainings ──────────────────────────────────────────────────────────────────

export const usePMSTrainingList = (filters: PMSTrainingFilters) =>
  useQuery({
    queryKey: ['pms', 'trainings', 'list', filters],
    queryFn: () => pmsTrainingService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const usePMSTrainingDetail = (id: string) =>
  useQuery({
    queryKey: ['pms', 'trainings', id],
    queryFn: () => pmsTrainingService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreatePMSTraining = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pmsTrainingService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
    },
  });
};

export const useUpdatePMSTraining = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PMSTraining> }) =>
      pmsTrainingService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
      qc.setQueryData(['pms', 'trainings', vars.id], result.data);
    },
  });
};

export const useDeletePMSTraining = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pmsTrainingService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
    },
  });
};

export const useOpenPMSTrainingRegistration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pmsTrainingService.openRegistration,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
      qc.setQueryData(['pms', 'trainings', id], result.data);
    },
  });
};

export const useClosePMSTrainingRegistration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pmsTrainingService.closeRegistration,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
      qc.setQueryData(['pms', 'trainings', id], result.data);
    },
  });
};

export const useStartPMSTraining = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pmsTrainingService.start,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
      qc.setQueryData(['pms', 'trainings', id], result.data);
    },
  });
};

export const useCompletePMSTraining = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resultSummary }: { id: string; resultSummary?: PMSTraining['resultSummary'] }) =>
      pmsTrainingService.complete(id, resultSummary),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
      qc.setQueryData(['pms', 'trainings', vars.id], result.data);
    },
  });
};

export const useCancelPMSTraining = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      pmsTrainingService.cancel(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
      qc.setQueryData(['pms', 'trainings', vars.id], result.data);
    },
  });
};

export const useRegisterPMSTraining = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, memberId }: { id: string; memberId: string }) =>
      pmsTrainingService.register(id, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
    },
  });
};

export const useRecordPMSTrainingResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, memberId, result, certificateUrl }: { id: string; memberId: string; result: string; certificateUrl?: string }) =>
      pmsTrainingService.recordResult(id, memberId, result, certificateUrl),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['pms', 'trainings'] });
      qc.setQueryData(['pms', 'trainings', vars.id], result.data);
    },
  });
};
