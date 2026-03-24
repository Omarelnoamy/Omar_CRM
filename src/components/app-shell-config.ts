export type ProtectedPageMeta = {
  title: string;
  description: string;
};

const protectedPageMeta: Array<{
  match: (pathname: string) => boolean;
  meta: ProtectedPageMeta;
}> = [
  {
    match: (pathname) => pathname === "/dashboard",
    meta: {
      title: "Dashboard",
      description:
        "Track the pipeline, activity, and team performance at a glance.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/leads/"),
    meta: {
      title: "Lead Details",
      description:
        "Review the latest activity, ownership, and next steps for this lead.",
    },
  },
  {
    match: (pathname) => pathname === "/leads",
    meta: {
      title: "Leads",
      description:
        "Review the current pipeline and keep every lead moving forward.",
    },
  },
  {
    match: (pathname) => pathname === "/reminders",
    meta: {
      title: "Reminders",
      description: "Stay on top of follow-ups, commitments, and handoffs.",
    },
  },
  {
    match: (pathname) => pathname === "/users",
    meta: {
      title: "Users",
      description: "Manage access, assignments, and the active sales team.",
    },
  },
];

const defaultProtectedPageMeta: ProtectedPageMeta = {
  title: "CRM Workspace",
  description: "Manage the day-to-day work across the sales team.",
};

export function getProtectedPageMeta(pathname: string): ProtectedPageMeta {
  return (
    protectedPageMeta.find((route) => route.match(pathname))?.meta ??
    defaultProtectedPageMeta
  );
}

export function formatRoleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
