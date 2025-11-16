import { useState } from "react";
import { User } from "../App";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { FarmerProjects } from "./farmer/FarmerProjects";
import { FarmerTickets } from "./farmer/FarmerTickets";
import { ForestMapDrawer } from "./farmer/ForestMapDrawer";
import { LogOut, Trees } from "lucide-react";

interface FarmerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function FarmerDashboard({
  user,
  onLogout,
}: FarmerDashboardProps) {
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
              <p className="text-sm text-gray-600">
                Cộng tác viên
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p>{user.name}</p>
              <p className="text-sm text-gray-600">
                {user.email}
              </p>
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
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tickets">Nhiệm vụ</TabsTrigger>
            <TabsTrigger value="projects">Dự án</TabsTrigger>
            <TabsTrigger value="map">Bản đồ rừng</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <FarmerTickets />
          </TabsContent>

          <TabsContent value="projects">
            <FarmerProjects />
          </TabsContent>

          <TabsContent value="map">
            <ForestMapDrawer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}