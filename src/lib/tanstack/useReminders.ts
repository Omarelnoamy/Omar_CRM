import { Reminder } from "@/generated/prisma/client";
import { api } from "@/lib/api";
import {
  CreateReminderWithoutLeadInput,
  ListLeadRemindersRequest,
  ListMyRemindersRequest,
  UpdateReminderRequest,
} from "@/services/reminders/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationMeta } from "@/utils/pagination";

type ReminderListResponse = {
  reminders: (Reminder & { lead: { id: string; name: string } | null })[];
  pagination: PaginationMeta;
};

export function useCreateLeadReminder(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      request: CreateReminderWithoutLeadInput,
    ): Promise<Reminder> => {
      const { data } = await api.post(`/leads/${leadId}/reminders`, request);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["lead-reminders"] });
    },
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      request: CreateReminderWithoutLeadInput & { leadId: string },
    ): Promise<Reminder> => {
      const { leadId, ...payload } = request;
      const { data } = await api.post(`/leads/${leadId}/reminders`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["lead-reminders"] });
    },
  });
}

export function useGetLeadReminders(
  leadId: string,
  params: Omit<ListLeadRemindersRequest, "leadId">,
) {
  return useQuery({
    queryKey: ["lead-reminders", leadId, params],
    queryFn: async (): Promise<ReminderListResponse> => {
      const { data } = await api.get(`/leads/${leadId}/reminders`, { params });
      return data.data;
    },
    enabled: Boolean(leadId),
    refetchInterval: 1000 * 5,
  });
}

export function useGetMyReminders(params: ListMyRemindersRequest) {
  return useQuery({
    queryKey: ["reminders", params],
    queryFn: async (): Promise<ReminderListResponse> => {
      const { data } = await api.get("/reminders", { params });
      return data.data;
    },
    refetchInterval: 1000 * 5,
  });
}

export function useUpdateReminder(reminderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: UpdateReminderRequest): Promise<Reminder> => {
      const { data } = await api.patch(`/reminders/${reminderId}`, request);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["lead-reminders"] });
    },
  });
}
