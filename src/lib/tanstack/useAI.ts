import { CallFollowUp, LeadBrief } from "@/services/ai/schema";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGenerateLeadBrief(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<LeadBrief> => {
      const { data } = await api.post("/ai/lead-brief", { leadId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useSaveBrief(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brief: LeadBrief) => {
      const { data } = await api.post("/ai/lead-brief/save", {
        leadId,
        brief,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brief", leadId] });
    },
  });
}

export function useGetBrief(leadId: string) {
  return useQuery({
    queryKey: ["brief", leadId],
    queryFn: async (): Promise<{
      leadBrief: {
        id: string;
        leadId: string;
        brief: LeadBrief;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
      } | null;
    }> => {
      const { data } = await api.get(`/leads/${leadId}/lead-brief`);
      return data.data;
    },
    enabled: Boolean(leadId),
  });
}

export function useGenerateCallFollowup(leadId: string) {
  return useMutation({
    mutationFn: async (args: {
      callOutcome: string;
      agentNotes?: string;
    }): Promise<CallFollowUp> => {
      const { data } = await api.post("/ai/call-followup", {
        leadId,
        ...args,
      });
      return data.data;
    },
  });
}

export function useSaveCallFollowUp(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followup: CallFollowUp) => {
      const { data } = await api.post("/ai/call-followup/save", {
        leadId,
        followup,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
