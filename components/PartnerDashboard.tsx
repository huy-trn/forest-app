import { useTranslation } from 'react-i18next';
import { User } from "@/types/user";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { PartnerProjects } from "./partner/PartnerProjects";
import { PartnerTickets } from "./partner/PartnerTickets";
import { LogOut, Trees } from "lucide-react";
import { SelectLng } from './ui/select-lng';

interface PartnerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function PartnerDashboard({
  user,
  onLogout,
}: PartnerDashboardProps) {
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
              <h1>{t('partner.dashboard.title')}</h1>
              <p className="text-sm text-gray-600">
                {t('partner.dashboard.role')}
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
              {t('partner.dashboard.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tickets">{t('partner.dashboard.tickets')}</TabsTrigger>
            <TabsTrigger value="projects">{t('partner.dashboard.projects')}</TabsTrigger>
            <TabsTrigger value="map">{t('partner.dashboard.forestMap')}</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <PartnerTickets />
          </TabsContent>

          <TabsContent value="projects">
            <PartnerProjects />
          </TabsContent>

          <TabsContent value="map">
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
