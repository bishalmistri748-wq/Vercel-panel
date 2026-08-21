import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GFX License Control", template: "%s · GFX Panel" },
  description: "Premium license key management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-void text-white antialiased">{children}</body>
    </html>
  );
}
