import { useState } from 'react';
import type { UserRole, Location } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HelpRequestList } from './HelpRequestList';

interface LeftPanelProps {
  role: UserRole;
  onHelpRequestClick?: (location: Location) => void;
}

export function LeftPanel({ onHelpRequestClick }: LeftPanelProps) {
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

            <div className="h-full flex flex-col p-6 relative z-10">
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5 hover:scrollbar-thumb-white/30">
                <HelpRequestList onHelpRequestClick={onHelpRequestClick} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
