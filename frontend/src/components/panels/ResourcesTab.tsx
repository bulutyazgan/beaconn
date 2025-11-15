import { mockResources } from '@/data/mock-resources';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, Home, Droplet, Shield, Navigation, Phone } from 'lucide-react';
import type { ResourceType } from '@/types';

export function ResourcesTab() {
  const getIcon = (type: ResourceType) => {
    switch (type) {
      case 'hospital':
        return <Hospital className="w-5 h-5 drop-shadow-lg text-accent-red" />;
      case 'shelter':
        return <Home className="w-5 h-5 drop-shadow-lg text-accent-blue" />;
      case 'water':
        return <Droplet className="w-5 h-5 drop-shadow-lg text-accent-blue" />;
      case 'safe-zone':
        return <Shield className="w-5 h-5 drop-shadow-lg text-accent-green" />;
    }
  };

  const getResourceStyles = (type: ResourceType) => {
    switch (type) {
      case 'hospital':
        return {
          card: 'border-accent-red/30 bg-gradient-to-br from-accent-red/10 to-accent-red/5 hover:border-accent-red/50 hover:shadow-lg hover:shadow-accent-red/20',
          texture: 'bg-gradient-to-r from-accent-red/5 via-transparent to-accent-red/5',
          indicator: 'bg-accent-red shadow-accent-red/50',
          icon: 'bg-gradient-to-br from-accent-red/30 to-accent-red/20 border border-accent-red/30',
        };
      case 'shelter':
        return {
          card: 'border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 hover:border-accent-blue/50 hover:shadow-lg hover:shadow-accent-blue/20',
          texture: 'bg-gradient-to-r from-accent-blue/5 via-transparent to-accent-blue/5',
          indicator: 'bg-accent-blue shadow-accent-blue/50',
          icon: 'bg-gradient-to-br from-accent-blue/30 to-accent-blue/20 border border-accent-blue/30',
        };
      case 'water':
        return {
          card: 'border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 hover:border-accent-blue/50 hover:shadow-lg hover:shadow-accent-blue/20',
          texture: 'bg-gradient-to-r from-accent-blue/5 via-transparent to-accent-blue/5',
          indicator: 'bg-accent-blue shadow-accent-blue/50',
          icon: 'bg-gradient-to-br from-accent-blue/30 to-accent-blue/20 border border-accent-blue/30',
        };
      case 'safe-zone':
        return {
          card: 'border-accent-green/30 bg-gradient-to-br from-accent-green/10 to-accent-green/5 hover:border-accent-green/50 hover:shadow-lg hover:shadow-accent-green/20',
          texture: 'bg-gradient-to-r from-accent-green/5 via-transparent to-accent-green/5',
          indicator: 'bg-accent-green shadow-accent-green/50',
          icon: 'bg-gradient-to-br from-accent-green/30 to-accent-green/20 border border-accent-green/30',
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-accent-green font-semibold';
      case 'full':
        return 'text-accent-orange font-semibold';
      case 'closed':
        return 'text-accent-red font-semibold';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-3">
      {mockResources.map((resource) => {
        const styles = getResourceStyles(resource.type);
        return (
          <Card
            key={resource.id}
            className={`group cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${styles.card}`}
          >
            {/* Animated background texture */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${styles.texture}`} />

            {/* Type indicator bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.indicator} shadow-lg`} />

            <CardHeader className="relative pb-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 ${styles.icon}`}
                >
                  {getIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-bold text-white group-hover:text-white/90 transition-colors">
                    {resource.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400 mt-1.5 font-medium capitalize">
                    {resource.type.replace('-', ' ')} •{' '}
                    <span className={getStatusColor(resource.operatingStatus)}>
                      {resource.operatingStatus}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3 pt-0">
              {/* Capacity Info */}
              {resource.capacity && (
                <div className="text-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-gray-400 font-medium">Capacity</span>
                    <span className="text-white font-semibold">
                      {resource.currentOccupancy || 0} / {resource.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-background-elevated/50 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 shadow-sm ${
                        resource.operatingStatus === 'full'
                          ? 'bg-gradient-to-r from-accent-orange to-accent-orange/80 shadow-accent-orange/30'
                          : 'bg-gradient-to-r from-accent-green to-accent-green/80 shadow-accent-green/30'
                      }`}
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
                <div className="flex items-center gap-2 text-sm glass px-3 py-2 rounded-lg border border-white/5">
                  <Phone className="w-4 h-4 text-accent-blue" />
                  <span className="font-mono text-gray-300">{resource.contact}</span>
                </div>
              )}

              {/* Get Directions Button */}
              <Button
                variant="glass"
                size="sm"
                className="w-full bg-gradient-to-r from-accent-blue/20 to-accent-blue/10 border-accent-blue/30 hover:from-accent-blue/30 hover:to-accent-blue/20 hover:border-accent-blue/50 text-accent-blue hover:text-white font-semibold shadow-lg hover:shadow-accent-blue/20 transition-all duration-200"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
