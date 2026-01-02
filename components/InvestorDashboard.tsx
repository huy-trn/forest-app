 "use client";

import { useTranslation } from 'react-i18next';
import { User } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { InvestorProjects } from './investor/InvestorProjects';
import { InvestorRequestsView } from './investor/InvestorRequestsView';
import { PublicShowcase } from './investor/PublicShowcase';
import { DashboardHeader } from './dashboard/DashboardHeader';

interface InvestorDashboardProps {
  user: User;
  locale: string;
  onLogout: () => void;
}

export function InvestorDashboard({ user, locale, onLogout }: InvestorDashboardProps) {
  const { t } = useTranslation();
  return (
    <>
      <DashboardHeader
        title={t('investor.dashboard.title')}
        subtitle={t('investor.dashboard.role')}
        userName={user.name}
        userEmail={user.email}
        locale={locale}
        onLogout={onLogout}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="showcase" className="space-y-6">
          <TabsList>
            <TabsTrigger value="showcase">{t('investor.dashboard.showcase')}</TabsTrigger>
            <TabsTrigger value="projects">{t('investor.dashboard.projects')}</TabsTrigger>
            <TabsTrigger value="requests">{t('investor.dashboard.requests')}</TabsTrigger>
          </TabsList>

          <TabsContent value="showcase">
            <PublicShowcase />
          </TabsContent>

          <TabsContent value="projects">
            <InvestorProjects />
          </TabsContent>

          <TabsContent value="requests">
            <InvestorRequestsView user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
