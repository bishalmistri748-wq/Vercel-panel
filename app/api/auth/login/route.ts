import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, jsonError, jsonOk } from "@/lib/auth";

const schema = z.object({ username: z.string().min(1), password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input");

  const { username, password } = parsed.data;
  const admin = await prisma.admin.findFirst({ where: { OR: [{ username }, { email: username }] } });
  if (!admin) return jsonError("Invalid credentials", 401);

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return jsonError("Invalid credentials", 401);

  const session = await getSession();
  session.adminId = admin.id;
  await session.save();

  return jsonOk({ admin: { username: admin.username, email: admin.email } });
}
