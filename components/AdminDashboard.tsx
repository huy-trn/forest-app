 "use client";

import { useTranslation } from "react-i18next";
import { User } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { UserManagement } from "./admin/UserManagement";
import { ProjectManagement } from "./admin/ProjectManagement";
import { TicketManagement } from "./admin/TicketManagement";
import { InvestorRequests } from "./admin/InvestorRequests";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { PostManagement } from "./admin/PostManagement";

interface AdminDashboardProps {
  user: User;
  locale: string;
  onLogout: () => void;
}

export function AdminDashboard({
  user,
  locale,
  onLogout,
}: AdminDashboardProps) {
  const { t } = useTranslation();
  return (
    <>
      <DashboardHeader
        title={t('admin.dashboard.title')}
        subtitle={t('admin.dashboard.role')}
        userName={user.name}
        userEmail={user.email}
        locale={locale}
        onLogout={onLogout}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">{t('admin.dashboard.projects')}</TabsTrigger>
            <TabsTrigger value="tickets">{t('admin.dashboard.tickets')}</TabsTrigger>
            <TabsTrigger value="requests">{t('admin.dashboard.requests')}</TabsTrigger>
            <TabsTrigger value="users">{t('admin.dashboard.users')}</TabsTrigger>
            <TabsTrigger value="posts">{t('admin.posts.tab', { defaultValue: 'Blog posts' })}</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketManagement currentUser={user} />
          </TabsContent>

          <TabsContent value="requests">
            <InvestorRequests />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="posts">
            <PostManagement locale={locale} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
