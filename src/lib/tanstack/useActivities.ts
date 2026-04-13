import {
  CreateCallAttemptRequest,
  ActivitySummaryItem,
  GetLeadActivitiesRequest,
  ListLeadActivitiesResponseData,
} from "@/services/activity/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGetLeadActivities(request: GetLeadActivitiesRequest) {
  return useQuery({
    queryKey: ["activities", request],
    queryFn: async (): Promise<ListLeadActivitiesResponseData> => {
      const { data } = await api.get(`/leads/${request.leadId}/activities`, {
        params: {
          page: request.page,
          pageSize: request.pageSize,
        },
      });

      const payload = data?.data;
      if (payload == null) {
        throw new Error("Invalid response from activities API");
      }
      return payload;
    },
  });
}

export function useCreateNote(
  leadId: string,
  options?: { onSuccess?: () => void },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string): Promise<ActivitySummaryItem> => {
      const { data } = await api.post(`/leads/${leadId}/activities/note`, {
        content,
      });
      const payload = data?.data;
      if (payload == null) {
        throw new Error("Invalid response from note API");
      }
      return payload;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      options?.onSuccess?.();
    },
  });
}

export function useLogCallAttempt(
  leadId: string,
  options?: { onSuccess?: () => void },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: CreateCallAttemptRequest,
    ): Promise<ActivitySummaryItem> => {
      const { data } = await api.post(
        `/leads/${leadId}/activities/call-attempt`,
        body,
      );
      const payload = data?.data;
      if (payload == null) {
        throw new Error("Invalid response from call attempt API");
      }
      return payload;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      options?.onSuccess?.();
    },
  });
}
