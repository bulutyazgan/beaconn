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
        className="fixed left-6 top-24 z-40 bg-gradient-to-br from-background-elevated/90 to-background-elevated/60 border border-white/10 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 backdrop-blur-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-accent-blue" />
        )}
      </Button>

      {/* Panel */}
      <div
        className={`fixed left-0 top-20 bottom-0 z-30 w-96 transform transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Modern glassmorphic container with gradient border */}
        <div className="h-full relative">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-white/10 rounded-r-2xl" />

          {/* Main content container */}
          <div className="absolute inset-[1px] bg-gradient-to-br from-background-elevated/95 to-background-elevated/90 backdrop-blur-3xl rounded-r-2xl shadow-2xl overflow-hidden">
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 pointer-events-none" />

            <Tabs defaultValue="alerts" className="h-full flex flex-col p-6 relative z-10">
              {/* Enhanced tab list with better styling */}
              <TabsList className="grid grid-cols-3 w-full bg-gradient-to-br from-background-elevated/60 to-background-elevated/40 border border-white/10 p-1.5 rounded-2xl shadow-xl backdrop-blur-sm">
                <TabsTrigger
                  value="alerts"
                  className="text-sm font-semibold data-[state=active]:bg-gradient-to-br data-[state=active]:from-accent-orange/30 data-[state=active]:to-accent-orange/15 data-[state=active]:text-accent-orange data-[state=active]:shadow-lg data-[state=active]:shadow-accent-orange/20 data-[state=active]:border data-[state=active]:border-accent-orange/40 rounded-xl transition-all duration-300 hover:bg-white/5"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Alerts
                </TabsTrigger>
                <TabsTrigger
                  value="news"
                  className="text-sm font-semibold data-[state=active]:bg-gradient-to-br data-[state=active]:from-accent-blue/30 data-[state=active]:to-accent-blue/15 data-[state=active]:text-accent-blue data-[state=active]:shadow-lg data-[state=active]:shadow-accent-blue/20 data-[state=active]:border data-[state=active]:border-accent-blue/40 rounded-xl transition-all duration-300 hover:bg-white/5"
                >
                  <Newspaper className="w-4 h-4 mr-2" />
                  News
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="text-sm font-semibold data-[state=active]:bg-gradient-to-br data-[state=active]:from-accent-green/30 data-[state=active]:to-accent-green/15 data-[state=active]:text-accent-green data-[state=active]:shadow-lg data-[state=active]:shadow-accent-green/20 data-[state=active]:border data-[state=active]:border-accent-green/40 rounded-xl transition-all duration-300 hover:bg-white/5"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Resources
                </TabsTrigger>
              </TabsList>

              {/* Enhanced scrollable content area */}
              <div className="flex-1 overflow-y-auto mt-6 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5 hover:scrollbar-thumb-white/30">
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
        </div>
      </div>
    </>
  );
}
