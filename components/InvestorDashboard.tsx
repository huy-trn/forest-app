 "use client";

import { useTranslation } from 'react-i18next';
import { User } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { InvestorProjects } from './investor/InvestorProjects';
import { InvestorRequestsView } from './investor/InvestorRequestsView';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface InvestorDashboardProps {
  user: User;
  locale: string;
  onLogout: () => void;
}

export function InvestorDashboard({ user, locale, onLogout }: InvestorDashboardProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialTab = useMemo(
    () => searchParams.get("tab") || "projects",
    [searchParams]
  );
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(searchParams.get("tab") || "projects");
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setTab(value);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_55%),linear-gradient(180deg,_#f8fafc,_#f1f5f9)]">
      <DashboardHeader
        title={t('investor.dashboard.title')}
        subtitle={t(`roles.${user.role || 'investor'}`)}
        userName={user.name}
        userEmail={user.email}
        locale={locale}
        onLogout={onLogout}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="w-full flex-wrap h-auto justify-start">
            <TabsTrigger value="projects" className="flex-1 min-w-[140px]">{t('investor.dashboard.projects')}</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 min-w-[140px]">{t('investor.dashboard.requests')}</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <InvestorProjects locale={locale} />
          </TabsContent>

          <TabsContent value="requests">
            <InvestorRequestsView user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
