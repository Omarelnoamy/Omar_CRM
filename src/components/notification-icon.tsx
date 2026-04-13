"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  useGetNotifications,
  useMarkNotificationRead,
} from "@/lib/tanstack/useNotifications";

export function NotificationBell() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError } = useGetNotifications({ page, pageSize });
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const markRead = useMarkNotificationRead();

  const pageInfo = useMemo(() => data?.pagination, [data?.pagination]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-96 p-0">
        <div className="px-4 py-3">
          <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
        </div>
        <Separator />
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Loading notifications...
            </p>
          ) : null}
          {isError ? (
            <p className="px-4 py-8 text-center text-sm text-rose-600">
              Failed to load notifications.
            </p>
          ) : null}
          {!isLoading && !isError && notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-slate-500">
              <Inbox className="size-6" />
              <p className="text-sm">No notifications yet.</p>
            </div>
          ) : null}
          {!isLoading && !isError
            ? notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.leadId ? `/leads/${notification.leadId}` : "#"}
                  onClick={() => {
                    if (notification.readState === "UNREAD") {
                      markRead.mutate(notification.id);
                    }
                  }}
                  className="block px-4 py-3 hover:bg-slate-50"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </Link>
              ))
            : null}
        </div>
        <Separator />
        <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-500">
          <span>
            Page {pageInfo?.page ?? 1} of {Math.max(pageInfo?.pages ?? 1, 1)}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              disabled={isLoading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={isLoading || page >= Math.max(pageInfo?.pages ?? 1, 1)}
              onClick={() =>
                setPage((p) => Math.min(Math.max(pageInfo?.pages ?? 1, 1), p + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
