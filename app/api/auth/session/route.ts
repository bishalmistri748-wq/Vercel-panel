import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdmin, jsonOk, jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return jsonError("Unauthenticated", 401);
  return jsonOk({ admin });
}

const pwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const parsed = pwSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input");

  const full = await prisma.admin.findUnique({ where: { id: admin.id } });
  if (!full) return jsonError("Not found", 404);
  const valid = await bcrypt.compare(parsed.data.currentPassword, full.passwordHash);
  if (!valid) return jsonError("Current password is incorrect", 401);

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash: hash } });
  return jsonOk({});
}
