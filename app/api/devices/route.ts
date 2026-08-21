import { requireAdmin, jsonOk } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const devices = await prisma.device.findMany({
    orderBy: { lastSeen: "desc" },
    include: { license: { select: { key: true, status: true } } },
  });
  return jsonOk({ devices });
}
