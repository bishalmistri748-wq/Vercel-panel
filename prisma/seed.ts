import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const email = process.env.ADMIN_EMAIL || "admin@gfxpanel.local";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const existing = await prisma.admin.findFirst({ where: { username } });
  if (existing) {
    console.log("Admin already exists — skipping seed.");
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.admin.create({ data: { username, email, passwordHash: hash } });
  console.log(`✓ Admin created: ${username} / ${email}`);
  console.log(`  Password: ${password}`);
  console.log("  Change this immediately after first login.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
