 "use client";

import { useTranslation } from 'react-i18next';
import { User } from "@/types/user";
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { InvestorProjects } from './investor/InvestorProjects';
import { InvestorRequestsView } from './investor/InvestorRequestsView';
import { PublicShowcase } from './investor/PublicShowcase';
import { LogOut, Trees } from 'lucide-react';
import { SelectLng } from './ui/select-lng';

interface InvestorDashboardProps {
  user: User;
  onLogout: () => void;
}

export function InvestorDashboard({ user, onLogout }: InvestorDashboardProps) {
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
              <h1>{t('investor.dashboard.title')}</h1>
              <p className="text-sm text-gray-600">{t('investor.dashboard.role')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SelectLng />

            <div className="text-right">
              <p>{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('investor.dashboard.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
    </div>
  );
}
