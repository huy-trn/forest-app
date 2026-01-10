"use client";

import { useState } from "react";
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

  if (!isAuthenticated || !copilotRuntimeUrl) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <CopilotKit runtimeUrl={copilotRuntimeUrl}>
      <QueryClientProvider client={queryClient}>
        {children}
        <CopilotTools isAuthenticated={isAuthenticated} userRole={userRole} />
        <CopilotPopup
          instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have."}
          labels={{
            title: "Popup Assistant",
            initial: "Need any help?",
          }}
        />
      </QueryClientProvider>
    </CopilotKit>
  );
}
