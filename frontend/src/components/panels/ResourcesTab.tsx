import { mockResources } from '@/data/mock-resources';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, Home, Droplet, Shield, Navigation, Phone } from 'lucide-react';
import type { ResourceType } from '@/types';

export function ResourcesTab() {
  const getIcon = (type: ResourceType) => {
    switch (type) {
      case 'hospital':
        return <Hospital className="w-5 h-5 relative z-10 drop-shadow-lg text-purple-400" />;
      case 'shelter':
        return <Home className="w-5 h-5 relative z-10 drop-shadow-lg text-blue-400" />;
      case 'water':
        return <Droplet className="w-5 h-5 relative z-10 drop-shadow-lg text-blue-300" />;
      case 'safe-zone':
        return <Shield className="w-5 h-5 relative z-10 drop-shadow-lg text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-400 font-semibold';
      case 'full':
        return 'text-purple-400 font-semibold';
      case 'closed':
        return 'text-slate-500 font-semibold';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {mockResources.map((resource) => {
        return (
          <Card
            key={resource.id}
            className="group cursor-pointer relative overflow-hidden transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-0 shadow-2xl hover:shadow-blue-500/20"
          >
            {/* Multi-layer gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-black/20" />

            {/* Animated shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* Left gradient accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 via-purple-500 to-blue-600 shadow-lg shadow-blue-500/50" />

            <CardHeader className="relative pb-4">
              <div className="flex items-start gap-4">
                {/* Icon with gradient background */}
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-400/30 shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
                  {getIcon(resource.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:via-white group-hover:to-purple-300 transition-all duration-300">
                    {resource.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-2 font-medium capitalize">
                    {resource.type.replace('-', ' ')} •{' '}
                    <span className={getStatusColor(resource.operatingStatus)}>
                      {resource.operatingStatus}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-4 pt-0">
              {/* Capacity Info */}
              {resource.capacity && (
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Capacity</span>
                    <span className="text-sm text-white font-bold">
                      {resource.currentOccupancy || 0} / {resource.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950/50 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 shadow-lg shadow-blue-500/30 transition-all duration-300"
                      style={{
                        width: `${
                          ((resource.currentOccupancy || 0) / resource.capacity) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {resource.contact && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800/50 to-slate-900/50 px-4 py-3 rounded-xl border border-white/5">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-sm text-slate-300">{resource.contact}</span>
                </div>
              )}

              {/* Get Directions Button */}
              <Button
                variant="glass"
                size="sm"
                className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 hover:from-blue-500/30 hover:to-purple-500/30 hover:border-purple-400/50 text-white font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </CardContent>

            {/* Bottom gradient accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          </Card>
        );
      })}
    </div>
  );
}
