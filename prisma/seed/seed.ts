import { prisma } from "@/lib/prisma";
import supabaseAdmin from "@/lib/supabase/admin";

const seed = async () => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@crm.com",
    password: "admin123",
    email_confirm: true,
  });

  if (error) {
    console.error("Error creating admin user", error);
    throw error;
    process.exit(1);
  }

  console.log(`Admin user created, ${data.user.id}`);

  const admin = await prisma.profile.create({
    data: {
      id: data.user.id,
      email: "admin@crm.com",
      name: "Omar Elnoamy",
      role: "ADMIN",
    },
  });
  console.log(`Admin Created: ${admin.id}`);
};
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
