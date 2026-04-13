import "dotenv/config";

import { prisma } from "@/lib/prisma";
import supabaseAdmin from "@/lib/supabase/admin";
import { Role } from "@/generated/prisma/client";

/** Dev passwords only — change in production. */
const AGENT_SEED = [
  { email: "agent@crm.com", password: "agent123", name: "Sales Agent" },
  { email: "alex.rivera@crm.com", password: "agent123", name: "Alex Rivera" },
  { email: "jamie.chen@crm.com", password: "agent123", name: "Jamie Chen" },
  { email: "sam.okonkwo@crm.com", password: "agent123", name: "Sam Okonkwo" },
] as const;

async function ensureAuthUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (
    error &&
    error.code !== "email_exists" &&
    !/already registered|already exists/i.test(error.message)
  ) {
    console.error(`Auth error for ${email}:`, error);
    throw error;
  }

  let userId = data.user?.id;
  if (!userId) {
    const existing = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const found = existing.data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!found) {
      throw new Error(`Could not find or create auth user for ${email}`);
    }
    userId = found.id;
  }

  return userId;
}

const main = async () => {
  for (const agent of AGENT_SEED) {
    const id = await ensureAuthUser(agent.email, agent.password);
    const profile = await prisma.profile.upsert({
      where: { id },
      update: {
        email: agent.email,
        name: agent.name,
        role: Role.AGENT,
        isActive: true,
      },
      create: {
        id,
        email: agent.email,
        name: agent.name,
        role: Role.AGENT,
      },
    });
    console.log(`Agent ready: ${profile.name} <${profile.email}>`);
  }

  const agents = await prisma.profile.findMany({
    where: { role: Role.AGENT, isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { email: "asc" },
  });

  console.log(`Total active agents: ${agents.length}`);
  console.log(agents);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
