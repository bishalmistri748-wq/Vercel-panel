import { customAlphabet } from "nanoid";

const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const gen = customAlphabet(CHARS, 12);

export function generateLicenseKey(): string {
  const raw = gen();
  return `GFX-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export const DURATION_OPTIONS = [
  { label: "1 Day", days: 1 },
  { label: "3 Days", days: 3 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "180 Days", days: 180 },
  { label: "365 Days", days: 365 },
  { label: "Lifetime", days: 36500 },
];

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function statusLabel(status: string, expiresAt: Date | null): string {
  if (status === "REVOKED") return "REVOKED";
  if (status === "EXPIRED") return "EXPIRED";
  if (status === "INACTIVE") return "INACTIVE";
  if (expiresAt) {
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 86400000);
    if (daysLeft <= 3 && daysLeft > 0) return "EXPIRING";
  }
  return "ACTIVE";
}
