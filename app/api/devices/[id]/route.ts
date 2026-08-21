import { NextRequest } from "next/server";
import { requireAdmin, jsonOk, jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
  const { action } = await req.json().catch(() => ({}));
  const device = await prisma.device.findUnique({ where: { id: params.id } });
  if (!device) return jsonError("Device not found", 404);

  if (action === "unbind") {
    await prisma.device.delete({ where: { id: params.id } });
  } else if (action === "block") {
    await prisma.device.update({ where: { id: params.id }, data: { blocked: true } });
  } else {
    return jsonError("Unknown action");
  }
  return jsonOk({});
}
