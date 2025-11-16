import { useState } from 'react';
import type { UserRole, Location, HelpRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HelpRequestList } from './HelpRequestList';

interface LeftPanelProps {
  role: UserRole;
  helpRequests?: HelpRequest[];
  onHelpRequestClick?: (request: HelpRequest) => void;
  onLocationClick?: (location: Location) => void;
}

export function LeftPanel({ helpRequests, onHelpRequestClick, onLocationClick }: LeftPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="glass"
        size="icon"
        className="fixed left-6 top-24 z-40 bg-gradient-to-br from-neutral-700/95 to-neutral-800/90 border border-white/15 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:scale-110 transition-all duration-300 backdrop-blur-2xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-neutral-100 drop-shadow-lg" />
        ) : (
          <ChevronRight className="w-5 h-5 text-primary drop-shadow-lg" />
        )}
      </Button>

      {/* Panel */}
      <div
        className={`fixed left-0 top-20 bottom-0 z-30 w-96 transform transition-all duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Modern glassmorphic container with gradient border */}
        <div className="h-full relative">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-primary/10 to-secondary/15 rounded-r-3xl shadow-2xl" />

          {/* Main content container */}
          <div className="absolute inset-[1px] bg-gradient-to-br from-neutral-800/98 to-neutral-900/95 backdrop-blur-3xl rounded-r-3xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 pointer-events-none" />

            <div className="h-full flex flex-col p-6 relative z-10">
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-white/5 hover:scrollbar-thumb-primary/50">
                <HelpRequestList
                  helpRequests={helpRequests}
                  onHelpRequestClick={onHelpRequestClick}
                  onLocationClick={onLocationClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
