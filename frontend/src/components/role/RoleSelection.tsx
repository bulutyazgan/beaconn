import type { UserRole } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, HandHelping } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="h-screen w-full flex flex-col bg-background-primary p-4 overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-2 py-4 shrink-0">
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white">Beaconn</h1>
        <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-gray-400">Connect with help during emergencies</p>
      </div>

      {/* Role Selection Cards - Takes remaining space */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Victim Role */}
        <Card className="flex-1 glass-hover cursor-pointer group card-victim overflow-hidden" onClick={() => onSelectRole('victim')}>
          <Button className="w-full h-full p-6 md:p-8 lg:p-10">
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="mb-6 md:mb-8 lg:mb-10 p-6 md:p-8 lg:p-12 rounded-full card-victim-icon-bg group-hover:card-victim-icon-bg-hover transition-colors shrink-0">
                <Heart className="icon-victim" style={{ strokeWidth: '1.5px', color: '#ff0844' }} />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold mb-4 md:mb-6 lg:mb-8 shrink-0">I Need Help</h2>
              <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-400 text-center whitespace-normal wrap-break-word max-w-2xl px-6 md:px-8">
                Request assistance and access emergency resources
              </p>
            </div>
          </Button>
        </Card>

        {/* Responder Role */}
        <Card className="flex-1 glass-hover cursor-pointer group card-responder overflow-hidden" onClick={() => onSelectRole('responder')}>
          <Button className="w-full h-full p-6 md:p-8 lg:p-10">
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="mb-6 md:mb-8 lg:mb-10 p-6 md:p-8 lg:p-12 rounded-full card-responder-icon-bg group-hover:card-responder-icon-bg-hover transition-colors shrink-0">
                <HandHelping className="icon-responder" style={{ strokeWidth: '1.5px', color: '#00ff88' }} />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold mb-4 md:mb-6 lg:mb-8 shrink-0">I Want to Help</h2>
              <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-400 text-center whitespace-normal wrap-break-word max-w-2xl px-6 md:px-8">
                Respond to requests and coordinate relief efforts
              </p>
            </div>
          </Button>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm md:text-base lg:text-lg text-gray-500 py-4 shrink-0">
        <p>We are here to help, but call 999 first.</p>
      </div>
    </div>
  );
}
