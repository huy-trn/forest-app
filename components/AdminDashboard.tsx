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
import { PartnerMap } from "./partner/PartnerMap";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
        title={t('admin.dashboard.title')}
        subtitle={t('admin.dashboard.role')}
        userName={user.name}
        userEmail={user.email}
        locale={locale}
        onLogout={onLogout}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">{t('admin.dashboard.projects')}</TabsTrigger>
            <TabsTrigger value="tickets">{t('admin.dashboard.tickets')}</TabsTrigger>
            <TabsTrigger value="requests">{t('admin.dashboard.requests')}</TabsTrigger>
            <TabsTrigger value="users">{t('admin.dashboard.users')}</TabsTrigger>
            <TabsTrigger value="posts">{t('admin.posts.tab', { defaultValue: 'Blog posts' })}</TabsTrigger>
            <TabsTrigger value="map">{t('partner.dashboard.forestMap')}</TabsTrigger>
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

          <TabsContent value="map">
            <PartnerMap />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
