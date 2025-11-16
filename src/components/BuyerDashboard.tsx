import { useState } from 'react';
import { User } from '../App';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BuyerProjects } from './buyer/BuyerProjects';
import { BuyerRequestsView } from './buyer/BuyerRequestsView';
import { PublicShowcase } from './buyer/PublicShowcase';
import { LogOut, Trees } from 'lucide-react';

interface BuyerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function BuyerDashboard({ user, onLogout }: BuyerDashboardProps) {
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
              <h1>Hệ Thống Quản Lý Rừng</h1>
              <p className="text-sm text-gray-600">Nhà đầu tư</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p>{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="showcase" className="space-y-6">
          <TabsList>
            <TabsTrigger value="showcase">Giới thiệu</TabsTrigger>
            <TabsTrigger value="projects">Dự án của tôi</TabsTrigger>
            <TabsTrigger value="requests">Yêu cầu</TabsTrigger>
          </TabsList>

          <TabsContent value="showcase">
            <PublicShowcase />
          </TabsContent>

          <TabsContent value="projects">
            <BuyerProjects />
          </TabsContent>

          <TabsContent value="requests">
            <BuyerRequestsView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
