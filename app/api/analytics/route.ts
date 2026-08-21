import { NextRequest } from "next/server";
import { requireAdmin, jsonOk } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays, subHours, eachDayOfInterval, eachHourOfInterval, startOfDay, startOfHour } from "date-fns";

export async function GET(req: NextRequest) {
  await requireAdmin();
  const range = req.nextUrl.searchParams.get("range") || "7d";
  const now = new Date();

  let since: Date;
  let groupBy: "hour" | "day";
  let intervals: Date[];
  let fmt: string;

  switch (range) {
    case "24h": since = subHours(now, 24); groupBy = "hour"; fmt = "HH:mm";
      intervals = eachHourOfInterval({ start: since, end: now }); break;
    case "30d": since = subDays(now, 30); groupBy = "day"; fmt = "MMM d";
      intervals = eachDayOfInterval({ start: since, end: now }); break;
    case "90d": since = subDays(now, 90); groupBy = "day"; fmt = "MMM d";
      intervals = eachDayOfInterval({ start: since, end: now }); break;
    default: since = subDays(now, 7); groupBy = "day"; fmt = "EEE";
      intervals = eachDayOfInterval({ start: since, end: now }); break;
  }

  const [logs, licenses] = await Promise.all([
    prisma.verificationLog.findMany({ where: { createdAt: { gte: since } }, select: { success: true, createdAt: true } }),
    prisma.license.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, status: true } }),
  ]);

  function bucket(date: Date) {
    return groupBy === "hour" ? startOfHour(date).getTime() : startOfDay(date).getTime();
  }

  const logMap = new Map<number, { success: number; failed: number }>();
  logs.forEach(l => {
    const k = bucket(l.createdAt);
    const cur = logMap.get(k) || { success: 0, failed: 0 };
    if (l.success) cur.success++; else cur.failed++;
    logMap.set(k, cur);
  });

  const licMap = new Map<number, number>();
  licenses.forEach(l => {
    const k = bucket(l.createdAt);
    licMap.set(k, (licMap.get(k) || 0) + 1);
  });

  const verificationsByTime = intervals.map(d => ({
    label: format(d, fmt),
    count: (logMap.get(bucket(d))?.success || 0) + (logMap.get(bucket(d))?.failed || 0),
  }));
  const creationsByTime = intervals.map(d => ({ label: format(d, fmt), count: licMap.get(bucket(d)) || 0 }));
  const successVsFail = intervals.map(d => ({
    label: format(d, fmt),
    success: logMap.get(bucket(d))?.success || 0,
    failed: logMap.get(bucket(d))?.failed || 0,
  }));

  const [active, inactive, expired, revoked] = await Promise.all([
    prisma.license.count({ where: { status: "ACTIVE" } }),
    prisma.license.count({ where: { status: "INACTIVE" } }),
    prisma.license.count({ where: { status: "EXPIRED" } }),
    prisma.license.count({ where: { status: "REVOKED" } }),
  ]);

  const statusDist = [
    { name: "Active", value: active },
    { name: "Inactive", value: inactive },
    { name: "Expired", value: expired },
    { name: "Revoked", value: revoked },
  ].filter(d => d.value > 0);

  return jsonOk({ verificationsByTime, creationsByTime, successVsFail, statusDist });
}
