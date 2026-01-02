 "use client";

import { useTranslation } from 'react-i18next';
import { User } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PartnerProjects } from "./partner/PartnerProjects";
import { PartnerTickets } from "./partner/PartnerTickets";
import { PartnerMap } from "./partner/PartnerMap";
import { DashboardHeader } from "./dashboard/DashboardHeader";

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
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tickets">{t('partner.dashboard.tickets')}</TabsTrigger>
            <TabsTrigger value="projects">{t('partner.dashboard.projects')}</TabsTrigger>
            <TabsTrigger value="map">{t('partner.dashboard.forestMap')}</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <PartnerTickets user={user} />
          </TabsContent>

          <TabsContent value="projects">
            <PartnerProjects />
          </TabsContent>

          <TabsContent value="map">
            <PartnerMap />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
