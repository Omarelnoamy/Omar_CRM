"use client";

import { Role } from "@/generated/prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetLead } from "@/lib/tanstack/useLeads";
import { formatLeadDate, StatusBadge } from "@/components/leads/reusable";
import { Overview } from "@/components/leads/lead-details/lead-overview";
import { Reminders } from "@/components/leads/lead-details/Reminders";
import { Timeline } from "@/components/leads/lead-details/Timeline";

export function LeadDetailClient({ id, role }: { id: string; role: Role }) {
  const { data, isLoading, isError } = useGetLead(id);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading lead...</div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-sm text-destructive">
        Failed to load this lead.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{data.name}</h1>
            <StatusBadge status={data.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Created on {formatLeadDate(data.createdAt)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-0">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview data={data} role={role} />
        </TabsContent>

        <TabsContent value="timeline">
          <Timeline leadId={id} />
        </TabsContent>

        <TabsContent value="reminders">
          <Reminders leadId={id} />
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              File uploads will be built in a later session.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
