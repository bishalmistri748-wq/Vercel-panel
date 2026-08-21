import { prisma } from "./prisma";

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MS);

  try {
    const record = await prisma.rateLimit.upsert({
      where: { identifier },
      update: {
        count: {
          increment: 1,
        },
        windowStart: {
          // Reset window if it's expired
          set: new Date(),
        },
      },
      create: {
        identifier,
        count: 1,
        windowStart: new Date(),
      },
    });

    // Reset if window has expired
    if (record.windowStart < windowStart) {
      await prisma.rateLimit.update({
        where: { identifier },
        data: { count: 1, windowStart: new Date() },
      });
      return true;
    }

    return record.count <= MAX_REQUESTS;
  } catch {
    return true; // Allow on error
  }
}
