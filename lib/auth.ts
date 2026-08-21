import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export interface SessionData {
  adminId?: string;
  sessionToken?: string;
}

export const sessionOptions: SessionOptions = {
  cookieName: "gfx_session",
  password: process.env.AUTH_SECRET ?? "fallback-dev-secret-change-in-production",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12, // 12h
  },
};

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.adminId) redirect("/login");

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, username: true, email: true },
  });
  if (!admin) {
    await session.destroy();
    redirect("/login");
  }
  return admin;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ success: false, message }, { status });
}

export function jsonOk(data: object, status = 200) {
  return Response.json({ success: true, ...data }, { status });
}
