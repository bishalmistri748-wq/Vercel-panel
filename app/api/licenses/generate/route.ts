import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin, jsonOk, jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/keys";

const schema = z.object({
  durationDays: z.number().int().min(1),
  maxDevices: z.number().int().min(1).max(10),
  quantity: z.number().int().min(1).max(50),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input");

  const { durationDays, maxDevices, quantity, note } = parsed.data;
  const keys: string[] = [];

  for (let i = 0; i < quantity; i++) {
    let key = generateLicenseKey();
    // Retry on collision (astronomically rare)
    while (await prisma.license.findUnique({ where: { key } })) { key = generateLicenseKey(); }
    await prisma.license.create({ data: { key, durationDays, maxDevices, note: note || null } });
    keys.push(key);
  }

  return jsonOk({ keys });
}
