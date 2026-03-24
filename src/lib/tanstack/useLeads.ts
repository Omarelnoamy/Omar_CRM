import {
  CreateLeadRequest,
  EditLeadRequest,
  LeadDetail,
  ListLeadsParams,
  ListLeadsResponseData,
} from "@/services/lead/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGetLeads(params: ListLeadsParams) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: async (): Promise<ListLeadsResponseData> => {
      const { data } = await api.get("/leads", {
        params,
      });
      return data.data;
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lead: CreateLeadRequest): Promise<LeadDetail> => {
      const { data } = await api.post("/leads", lead);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useGetLead(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async (): Promise<LeadDetail> => {
      const { data } = await api.get(`/leads/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useEditLead(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EditLeadRequest): Promise<LeadDetail> => {
      const { data } = await api.patch(`/leads/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({
        queryKey: ["activities", { leadId: id }],
      });
    },
  });
}
