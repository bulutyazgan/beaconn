import type { UserRole, DisasterInfo } from '@/types';
import { Settings, Users, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface HeaderProps {
  role: UserRole;
  disaster: DisasterInfo;
  onChangeRole: () => void;
}

export function Header({ role, disaster, onChangeRole }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-glass-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo and Disaster Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-red/20 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-accent-red" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">Emergency Response</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-elevated border border-glass-border">
            <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm font-mono text-gray-300">
              {disaster.name} • {format(disaster.date, 'MMM d')}
            </span>
            <MapPin className="w-3 h-3 text-gray-500" />
          </div>
        </div>

        {/* Right: Role Badge and Settings */}
        <div className="flex items-center gap-3">
          {/* Role Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              role === 'victim'
                ? 'bg-accent-red/10 border-accent-red/30 text-accent-red'
                : 'bg-accent-green/10 border-accent-green/30 text-accent-green'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium capitalize hidden sm:inline">
              {role}
            </span>
          </div>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onChangeRole}
            title="Change Role"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
