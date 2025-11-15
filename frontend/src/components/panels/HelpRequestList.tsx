import {
  AlertCircle,
  Heart,
  Home,
  LifeBuoy,
  Package,
  HelpCircle,
  Users,
  Clock,
  MapPin
} from 'lucide-react';
import { mockHelpRequests } from '@/data/mock-help-requests';
import type { HelpRequestType, Urgency, Location } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface HelpRequestListProps {
  onHelpRequestClick?: (location: Location) => void;
}

// Icon mapping for help request types
const typeIcons: Record<HelpRequestType, typeof AlertCircle> = {
  medical: Heart,
  food: Package,
  shelter: Home,
  rescue: LifeBuoy,
  supplies: Package,
  other: HelpCircle,
};

// Color mapping for urgency levels
const urgencyColors = {
  critical: {
    bg: 'from-red-500/30 to-red-600/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    indicator: 'bg-red-500',
  },
  high: {
    bg: 'from-orange-500/30 to-orange-600/20',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/20',
    indicator: 'bg-orange-500',
  },
  medium: {
    bg: 'from-yellow-500/30 to-yellow-600/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
    indicator: 'bg-yellow-500',
  },
  low: {
    bg: 'from-blue-500/30 to-blue-600/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    indicator: 'bg-blue-500',
  },
};

// Type color mapping
const typeColors: Record<HelpRequestType, string> = {
  medical: 'text-red-400',
  food: 'text-green-400',
  shelter: 'text-blue-400',
  rescue: 'text-orange-400',
  supplies: 'text-purple-400',
  other: 'text-gray-400',
};

export function HelpRequestList({ onHelpRequestClick }: HelpRequestListProps) {
  // Filter to show only pending requests
  const pendingRequests = mockHelpRequests
    .filter(req => req.status === 'pending')
    .sort((a, b) => {
      // Sort by urgency (critical > high > medium > low)
      const urgencyOrder: Record<Urgency, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];

      // If same urgency, sort by time (newest first)
      if (urgencyDiff === 0) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }

      return urgencyDiff;
    });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Help Requests</h2>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <AlertCircle className="w-4 h-4" />
          <span>{pendingRequests.length} pending</span>
        </div>
      </div>

      {/* Request List */}
      {pendingRequests.length === 0 ? (
        <div className="text-center py-8 text-white/40">
          <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No pending help requests in this area</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map((request) => {
            const Icon = typeIcons[request.type];
            const colors = urgencyColors[request.urgency];

            return (
              <div
                key={request.id}
                onClick={() => onHelpRequestClick?.(request.location)}
                className={`relative group overflow-hidden rounded-xl border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-sm shadow-lg ${colors.glow} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
              >
                {/* Urgency indicator bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.indicator}`} />

                <div className="p-4 pl-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/10 ${typeColors[request.type]} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">
                          {request.userName}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-medium ${colors.text} capitalize`}>
                            {request.urgency}
                          </span>
                          <span className="text-xs text-white/40">•</span>
                          <span className={`text-xs ${typeColors[request.type]} capitalize`}>
                            {request.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-white/70 mb-3 line-clamp-2">
                    {request.description}
                  </p>

                  {/* Footer info */}
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{request.peopleCount} {request.peopleCount === 1 ? 'person' : 'people'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDistanceToNow(request.createdAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-accent-blue/70 group-hover:text-accent-blue transition-colors">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs">View on map</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
