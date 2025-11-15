import { useState } from 'react';
import type { UserRole } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Bell, Newspaper, MapPin } from 'lucide-react';
import { AlertsTab } from './AlertsTab';
import { NewsTab } from './NewsTab';
import { ResourcesTab } from './ResourcesTab';

interface LeftPanelProps {
  role: UserRole;
}

export function LeftPanel({ }: LeftPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="glass"
        size="icon"
        className="fixed left-4 top-20 z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </Button>

      {/* Panel */}
      <div
        className={`fixed left-0 top-16 bottom-0 z-30 w-80 glass border-r border-glass-border transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Tabs defaultValue="alerts" className="h-full flex flex-col">
          <TabsList className="m-4 grid grid-cols-3 w-auto">
            <TabsTrigger value="alerts" className="text-xs">
              <Bell className="w-4 h-4 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="news" className="text-xs">
              <Newspaper className="w-4 h-4 mr-1" />
              News
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-xs">
              <MapPin className="w-4 h-4 mr-1" />
              Resources
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="alerts" className="m-0">
              <AlertsTab />
            </TabsContent>

            <TabsContent value="news" className="m-0">
              <NewsTab />
            </TabsContent>

            <TabsContent value="resources" className="m-0">
              <ResourcesTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
