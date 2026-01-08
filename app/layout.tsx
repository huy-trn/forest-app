import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ensureRootAdmin } from "@/lib/init-root-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forest Management Web App",
  description: "Role-based dashboards for admins, partners, and investors.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureRootAdmin();

  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
