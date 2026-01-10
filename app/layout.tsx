import type { Metadata } from "next";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { Providers } from "./providers";
import { ensureRootAdmin } from "@/lib/init-root-admin";
import { getUserFromCookies } from "@/lib/auth-helpers";

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
  const user = await getUserFromCookies();
  const copilotRuntimeUrl = process.env.COPILOTKIT_RUNTIME_URL ?? "/api/copilotkit";

  return (
    <html lang="en">
      <body>
        <Providers
          isAuthenticated={!!user}
          userRole={user?.role ?? null}
          copilotRuntimeUrl={copilotRuntimeUrl}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
