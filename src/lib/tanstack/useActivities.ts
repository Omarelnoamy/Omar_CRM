import {
  GetLeadActivitiesRequest,
  ListLeadActivitiesResponseData,
} from "@/services/activity/schema";
import { useQuery } from "@tanstack/react-query";
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

      return data.data;
    },
  });
}
