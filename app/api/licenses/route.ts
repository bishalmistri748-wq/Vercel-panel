import { requireAdmin, jsonOk, jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { devices: true } } },
  });
  return jsonOk({ licenses });
}
