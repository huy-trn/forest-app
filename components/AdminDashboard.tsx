 "use client";

import { useTranslation } from "react-i18next";
import { User } from "@/types/user";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { UserManagement } from "./admin/UserManagement";
import { ProjectManagement } from "./admin/ProjectManagement";
import { TicketManagement } from "./admin/TicketManagement";
import { InvestorRequests } from "./admin/InvestorRequests";
import { LogOut, Trees } from "lucide-react";
import { SelectLng } from "./ui/select-lng";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Trees className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>{t('admin.dashboard.title')}</h1>
              <p className="text-sm text-gray-600">
                {t('admin.dashboard.role')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SelectLng />
            <div className="text-right">
              <p>{user.name}</p>
              <p className="text-sm text-gray-600">
                {user.email}
              </p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('admin.dashboard.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">{t('admin.dashboard.projects')}</TabsTrigger>
            <TabsTrigger value="tickets">{t('admin.dashboard.tickets')}</TabsTrigger>
            <TabsTrigger value="requests">{t('admin.dashboard.requests')}</TabsTrigger>
            <TabsTrigger value="users">{t('admin.dashboard.users')}</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketManagement />
          </TabsContent>

          <TabsContent value="requests">
            <InvestorRequests />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
