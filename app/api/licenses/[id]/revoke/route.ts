import { NextRequest } from "next/server";
import { requireAdmin, jsonOk, jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
  const license = await prisma.license.findUnique({ where: { id: params.id } });
  if (!license) return jsonError("Not found", 404);
  await prisma.license.update({ where: { id: params.id }, data: { status: "REVOKED", revokedAt: new Date() } });
  return jsonOk({});
}
