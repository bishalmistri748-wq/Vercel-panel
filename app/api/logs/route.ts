import { requireAdmin, jsonOk } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const logs = await prisma.verificationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return jsonOk({ logs });
}
