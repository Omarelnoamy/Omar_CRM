import {
  ListNotificationsParams,
  ListNotificationsResponseData,
  NotificationListItem,
} from "@/services/notification";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetNotifications(params: ListNotificationsParams) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async (): Promise<ListNotificationsResponseData> => {
      const { data } = await api.get("/notifications", { params });
      return data.data;
    },
    refetchInterval: 1000 * 5,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<NotificationListItem> => {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
