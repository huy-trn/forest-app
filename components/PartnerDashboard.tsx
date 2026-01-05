 "use client";

import { useTranslation } from 'react-i18next';
import { User } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PartnerProjects } from "./partner/PartnerProjects";
import { PartnerTickets } from "./partner/PartnerTickets";
import { ProjectsMapPanel } from "./project-map/ProjectsMapPanel";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface PartnerDashboardProps {
  user: User;
  locale: string;
  onLogout: () => void;
}

export function PartnerDashboard({
  user,
  locale,
  onLogout,
}: PartnerDashboardProps) {
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
    <>
      <DashboardHeader
        title={t('partner.dashboard.title')}
        subtitle={t('partner.dashboard.role')}
        userName={user.name}
        userEmail={user.email}
        locale={locale}
        onLogout={onLogout}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">{t('partner.dashboard.projects')}</TabsTrigger>
            <TabsTrigger value="tickets">{t('partner.dashboard.tickets')}</TabsTrigger>
            <TabsTrigger value="map">{t('partner.dashboard.forestMap')}</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <PartnerProjects />
          </TabsContent>

          <TabsContent value="tickets">
            <PartnerTickets user={user} />
          </TabsContent>

          <TabsContent value="map">
            <ProjectsMapPanel />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
