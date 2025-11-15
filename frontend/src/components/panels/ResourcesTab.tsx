import { mockResources } from '@/data/mock-resources';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, Home, Droplet, Shield, Navigation, Phone } from 'lucide-react';
import type { ResourceType } from '@/types';

export function ResourcesTab() {
  const getIcon = (type: ResourceType) => {
    switch (type) {
      case 'hospital':
        return <Hospital className="w-5 h-5 text-accent-red" />;
      case 'shelter':
        return <Home className="w-5 h-5 text-accent-blue" />;
      case 'water':
        return <Droplet className="w-5 h-5 text-accent-blue" />;
      case 'safe-zone':
        return <Shield className="w-5 h-5 text-accent-green" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-accent-green';
      case 'full':
        return 'text-accent-orange';
      case 'closed':
        return 'text-accent-red';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4 p-4">
      {mockResources.map((resource) => (
        <Card key={resource.id} className="border-glass-border">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-background-elevated">
                {getIcon(resource.type)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{resource.name}</CardTitle>
                <CardDescription className="text-xs mt-1 capitalize">
                  {resource.type.replace('-', ' ')} •{' '}
                  <span className={getStatusColor(resource.operatingStatus)}>
                    {resource.operatingStatus}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Capacity Info */}
            {resource.capacity && (
              <div className="text-sm">
                <span className="text-gray-400">Capacity: </span>
                <span className="text-white">
                  {resource.currentOccupancy || 0} / {resource.capacity}
                </span>
                <div className="w-full bg-background-elevated rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${
                      resource.operatingStatus === 'full'
                        ? 'bg-accent-orange'
                        : 'bg-accent-green'
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
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="font-mono">{resource.contact}</span>
              </div>
            )}

            {/* Get Directions Button */}
            <Button variant="glass" size="sm" className="w-full">
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
