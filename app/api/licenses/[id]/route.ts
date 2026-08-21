import { NextRequest } from "next/server";
import { requireAdmin, jsonOk, jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
  const license = await prisma.license.findUnique({ where: { id: params.id } });
  if (!license) return jsonError("License not found", 404);
  await prisma.license.delete({ where: { id: params.id } });
  return jsonOk({});
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
  const license = await prisma.license.findUnique({
    where: { id: params.id },
    include: { devices: true, logs: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!license) return jsonError("Not found", 404);
  return jsonOk({ license });
}
