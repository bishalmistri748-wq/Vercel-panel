import { getSession, requireAdmin, jsonOk, jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function POST() {
  const session = await getSession();
  await session.destroy();
  return jsonOk({});
}
