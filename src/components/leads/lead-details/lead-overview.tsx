"use client";

import { useState } from "react";

import { LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { Role } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useAssignableAgents, useEditLead } from "@/lib/tanstack/useLeads";
import {
  formatEnumLabel,
  formatLeadDate,
  StageBadge,
  StatusBadge,
} from "@/components/leads/reusable";
import type {
  EditLeadRequest,
  LeadAssigneeSummary,
  LeadDetail,
} from "@/services/lead/schema";

const leadStatuses = [LeadStatus.OPEN, LeadStatus.WON, LeadStatus.LOST];
const leadStages = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.QUALIFIED,
  LeadStage.NEGOTIATION,
];

function getFieldClassName() {
  return "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50";
}

/** Task 4: managers/admins may edit PII and reassign leads; server persists activity before/after values. */
function roleIsManagerOrAdmin(role: Role): boolean {
  return role === "MANAGER" || role === "ADMIN";
}

function agentsForAssignmentSelect(
  agents: LeadAssigneeSummary[],
  options: {
    isEditing: boolean;
    draft: { assignedToId: string } | null;
    canEditPrivilegedFields: boolean;
    assignedTo: LeadDetail["assignedTo"];
  },
): LeadAssigneeSummary[] {
  const { isEditing, draft, canEditPrivilegedFields, assignedTo } = options;
  if (!isEditing || !draft || !canEditPrivilegedFields) {
    return agents;
  }
  const id = draft.assignedToId.trim();
  if (
    id &&
    !agents.some((agent) => agent.id === id) &&
    assignedTo !== null &&
    assignedTo.id === id
  ) {
    return [
      ...agents,
      {
        id: assignedTo.id,
        name: assignedTo.name,
        email: assignedTo.email,
      },
    ];
  }
  return agents;
}

export function Overview({ data, role }: { data: LeadDetail; role: Role }) {
  const editLead = useEditLead(data.id);
  const canEditPrivilegedFields = roleIsManagerOrAdmin(role);

  const [isEditing, setIsEditing] = useState(false);
  const { data: agents = [] } = useAssignableAgents(
    canEditPrivilegedFields && isEditing,
  );

  const [draft, setDraft] = useState<{
    name: string;
    email: string;
    phone: string;
    status: LeadStatus;
    stage: LeadStage;
    assignedToId: string;
  } | null>(null);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!data || !draft) {
      return;
    }

    const payload: EditLeadRequest = {};

    if (canEditPrivilegedFields && draft.name !== data.name) {
      payload.name = draft.name;
    }

    if (canEditPrivilegedFields && draft.email !== data.email) {
      payload.email = draft.email;
    }

    if (canEditPrivilegedFields && draft.phone !== data.phone) {
      payload.phone = draft.phone;
    }

    if (draft.status !== data.status) {
      payload.status = draft.status;
    }

    if (draft.stage !== data.stage) {
      payload.stage = draft.stage;
    }

    if (canEditPrivilegedFields) {
      const next = draft.assignedToId.trim() === "" ? null : draft.assignedToId;
      const cur = data.assignedToId ?? null;
      if (next !== cur) {
        payload.assignedToId = next;
      }
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      setError("");
      return;
    }

    try {
      setError("");
      await editLead.mutateAsync(payload);
      setDraft(null);
      setIsEditing(false);
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Failed to update lead"));
    }
  }

  function handleCancel() {
    setError("");
    setDraft(null);
    setIsEditing(false);
  }

  function handleEditStart() {
    if (!data) {
      return;
    }

    setDraft({
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      stage: data.stage,
      assignedToId: data.assignedToId ?? "",
    });
    setError("");
    setIsEditing(true);
  }

  const selectedStatus = draft?.status ?? data.status;
  const selectedStage = draft?.stage ?? data.stage;
  const selectedName = draft?.name ?? data.name;
  const selectedEmail = draft?.email ?? data.email;
  const selectedPhone = draft?.phone ?? data.phone;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!isEditing ? (
          <Button onClick={handleEditStart}>Edit Lead</Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={editLead.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={editLead.isPending}>
              {editLead.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Full Name</p>
                {isEditing && canEditPrivilegedFields ? (
                  <Input
                    value={selectedName}
                    onChange={(event) =>
                      setDraft((currentDraft) =>
                        currentDraft
                          ? { ...currentDraft, name: event.target.value }
                          : currentDraft,
                      )
                    }
                    disabled={editLead.isPending}
                  />
                ) : (
                  <p className="font-medium">{data.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                {isEditing && canEditPrivilegedFields ? (
                  <Input
                    type="email"
                    value={selectedEmail}
                    onChange={(event) =>
                      setDraft((currentDraft) =>
                        currentDraft
                          ? { ...currentDraft, email: event.target.value }
                          : currentDraft,
                      )
                    }
                    disabled={editLead.isPending}
                  />
                ) : (
                  <p className="font-medium">{data.email}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                {isEditing && canEditPrivilegedFields ? (
                  <Input
                    value={selectedPhone}
                    onChange={(event) =>
                      setDraft((currentDraft) =>
                        currentDraft
                          ? { ...currentDraft, phone: event.target.value }
                          : currentDraft,
                      )
                    }
                    disabled={editLead.isPending}
                  />
                ) : (
                  <p className="font-medium">{data.phone}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatLeadDate(data.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status &amp; Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  id="status"
                  className={getFieldClassName()}
                  value={selectedStatus}
                  onChange={(event) =>
                    setDraft((currentDraft) =>
                      currentDraft
                        ? {
                            ...currentDraft,
                            status: event.target.value as LeadStatus,
                          }
                        : currentDraft,
                    )
                  }
                  disabled={!isEditing || editLead.isPending}
                >
                  {leadStatuses.map((currentStatus) => (
                    <option key={currentStatus} value={currentStatus}>
                      {formatEnumLabel(currentStatus)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="stage"
                >
                  Stage
                </label>
                <select
                  id="stage"
                  className={getFieldClassName()}
                  value={selectedStage}
                  onChange={(event) =>
                    setDraft((currentDraft) =>
                      currentDraft
                        ? {
                            ...currentDraft,
                            stage: event.target.value as LeadStage,
                          }
                        : currentDraft,
                    )
                  }
                  disabled={!isEditing || editLead.isPending}
                >
                  {leadStages.map((currentStage) => (
                    <option key={currentStage} value={currentStage}>
                      {formatEnumLabel(currentStage)}
                    </option>
                  ))}
                </select>
              </div>

              {!isEditing ? (
                <div className="flex items-center gap-2">
                  <StatusBadge status={data.status} />
                  <StageBadge stage={data.stage} />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canEditPrivilegedFields && isEditing && draft ? (
                <div className="space-y-2">
                  <label
                    className="text-sm text-muted-foreground"
                    htmlFor="assigned-agent"
                  >
                    Assign to
                  </label>
                  <select
                    id="assigned-agent"
                    className={getFieldClassName()}
                    value={draft.assignedToId}
                    onChange={(event) =>
                      setDraft((d) =>
                        d ? { ...d, assignedToId: event.target.value } : d,
                      )
                    }
                    disabled={editLead.isPending}
                  >
                    <option value="">Unassigned</option>
                    {agentsForAssignmentSelect(agents, {
                      isEditing,
                      draft,
                      canEditPrivilegedFields,
                      assignedTo: data.assignedTo,
                    }).map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : data.assignedTo ? (
                <div className="space-y-1">
                  <p className="font-medium">{data.assignedTo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.assignedTo.email}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </CardContent>
          </Card>

          {error ? (
            <p className="pt-4 text-sm text-destructive">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
