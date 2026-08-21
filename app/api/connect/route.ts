import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

const schema = z.object({
  key: z.string().min(1),
  deviceId: z.string().min(1),
  deviceName: z.string().optional(),
  appVersion: z.string().optional(),
});

function fail(message: string, status = 403) {
  return Response.json({ success: false, status: "invalid", message }, { status });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Rate limit: 10 requests/min per IP
  const allowed = await checkRateLimit(`connect:${ip}`);
  if (!allowed) return Response.json({ success: false, message: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid request body", 400);

  const { key, deviceId, deviceName, appVersion } = parsed.data;

  const license = await prisma.license.findUnique({
    where: { key },
    include: { devices: true },
  });

  async function log(success: boolean, reason?: string, licenseId?: string) {
    await prisma.verificationLog.create({
      data: { licenseKey: key, licenseId, deviceId, deviceName, appVersion, ip, success, reason },
    }).catch(() => {});
  }

  if (!license) { await log(false, "Key not found"); return fail("License key not found", 404); }
  if (license.status === "REVOKED") { await log(false, "Revoked", license.id); return fail("License has been revoked"); }

  const now = new Date();
  if (license.expiresAt && license.expiresAt < now) {
    await prisma.license.update({ where: { id: license.id }, data: { status: "EXPIRED" } });
    await log(false, "Expired", license.id);
    return fail("License has expired");
  }

  // Device check
  const existingDevice = license.devices.find(d => d.deviceId === deviceId);

  if (existingDevice) {
    if (existingDevice.blocked) { await log(false, "Device blocked", license.id); return fail("Device is blocked"); }
    // Update last seen
    await prisma.device.update({ where: { id: existingDevice.id }, data: { lastSeen: now, lastIp: ip, appVersion } });
  } else {
    // New device — check limit
    const activeDevices = license.devices.filter(d => !d.blocked);
    if (activeDevices.length >= license.maxDevices) {
      await log(false, "Device limit reached", license.id);
      return fail("Maximum device limit reached");
    }
    // First activation
    const updates: any = { status: "ACTIVE" };
    if (!license.activatedAt) {
      updates.activatedAt = now;
      updates.expiresAt = new Date(now.getTime() + license.durationDays * 86400000);
    }
    await Promise.all([
      prisma.license.update({ where: { id: license.id }, data: updates }),
      prisma.device.create({ data: { licenseId: license.id, deviceId, deviceName, appVersion, lastIp: ip } }),
    ]);
  }

  const expiresAt = license.expiresAt || new Date(now.getTime() + license.durationDays * 86400000);
  await log(true, undefined, license.id);
  return Response.json({ success: true, status: "active", expiresAt: expiresAt.toISOString() });
}
