import { prisma } from "@/lib/prisma";
import supabaseAdmin from "@/lib/supabase/admin";
import { LeadStage, LeadStatus, Role } from "@/generated/prisma/client";

const seed = async () => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@crm.com",
    password: "admin123",
    email_confirm: true,
  });

  if (
    error &&
    error.code !== "email_exists" &&
    !/already registered|already exists/i.test(error.message)
  ) {
    console.error("Error creating admin user", error);
    throw error;
  }

  let adminUserId = data.user?.id;
  if (!adminUserId) {
    const existing = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const existingAdmin = existing.data.users.find(
      (user) => user.email?.toLowerCase() === "admin@crm.com",
    );
    if (!existingAdmin) throw new Error("Could not find admin user in auth.");
    adminUserId = existingAdmin.id;
  }

  console.log(`Admin user ready: ${adminUserId}`);

  const admin = await prisma.profile.upsert({
    where: { id: adminUserId },
    update: {
      email: "admin@crm.com",
      name: "Omar Elnoamy",
      role: "ADMIN",
    },
    create: {
      id: adminUserId,
      email: "admin@crm.com",
      name: "Omar Elnoamy",
      role: "ADMIN",
    },
  });
  console.log(`Admin Created: ${admin.id}`);

  const assignableAgents = await prisma.profile.findMany({
    where: { role: { in: [Role.AGENT, Role.MANAGER] }, isActive: true },
    select: { id: true },
  });

  const firstNames = [
    "John",
    "Sarah",
    "Michael",
    "Liam",
    "Noah",
    "Olivia",
    "Emma",
    "Ava",
    "Sophia",
    "Mason",
    "Logan",
    "Lucas",
    "Ethan",
    "Mia",
    "Isabella",
    "Amelia",
    "Harper",
    "Evelyn",
    "Abigail",
    "Charlotte",
    "Daniel",
    "Henry",
    "Sebastian",
    "Jack",
    "Aiden",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Garcia",
    "Rodriguez",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Thompson",
    "Martinez",
    "Clark",
    "Lewis",
    "Walker",
    "Hall",
    "Allen",
  ];

  const leadsSeed = Array.from({ length: 25 }, (_, index) => {
    const firstName = firstNames[index];
    const lastName = lastNames[index];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const phone = `+1 555-${String(1000 + index * 17).padStart(4, "0")}`;
    const stageCycle: LeadStage[] = ["NEW", "CONTACTED", "QUALIFIED", "NEGOTIATION"];
    const statusCycle: LeadStatus[] = ["OPEN", "OPEN", "WON", "LOST"];
    const createdAt = new Date(Date.now() - index * 24 * 60 * 60 * 1000);

    const assignedToId =
      assignableAgents.length > 0
        ? assignableAgents[index % assignableAgents.length].id
        : admin.id;

    return {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      stage: stageCycle[index % stageCycle.length],
      status: statusCycle[index % statusCycle.length],
      assignedToId,
      createdAt,
    };
  });

  await prisma.lead.deleteMany({
    where: {
      email: {
        in: leadsSeed.map((lead) => lead.email),
      },
    },
  });

  await prisma.lead.createMany({ data: leadsSeed });

  console.log(`Seeded ${leadsSeed.length} leads.`);
};
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
