"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import { CopilotTools } from "./CopilotTools";
import "@/i18n";

type ProvidersProps = {
  children: React.ReactNode;
  isAuthenticated: boolean;
  userRole: string | null;
  copilotRuntimeUrl?: string;
};

export function Providers({ children, isAuthenticated, userRole, copilotRuntimeUrl }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { t } = useTranslation();

  return (
    <CopilotKit runtimeUrl={copilotRuntimeUrl}>
      <QueryClientProvider client={queryClient}>
        {children}
        <CopilotTools isAuthenticated={isAuthenticated} userRole={userRole} />
        <CopilotPopup
          instructions={t("copilot.instructions")}
          labels={{
            title: t("copilot.title"),
            initial: t("copilot.initial"),
          }}
        />
      </QueryClientProvider>
    </CopilotKit>
  );
}
