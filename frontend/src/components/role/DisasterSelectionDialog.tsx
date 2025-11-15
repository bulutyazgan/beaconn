import type { DisasterInfo } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Wind, Waves, Droplets } from 'lucide-react';
import { format } from 'date-fns';

interface DisasterSelectionDialogProps {
  open: boolean;
  disasters: DisasterInfo[];
  onSelect: (disasterId: string) => void;
}

export function DisasterSelectionDialog({
  open,
  disasters,
  onSelect,
}: DisasterSelectionDialogProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'earthquake':
        return <AlertCircle className="w-6 h-6 text-accent-orange" />;
      case 'hurricane':
        return <Wind className="w-6 h-6 text-accent-blue" />;
      case 'tsunami':
        return <Waves className="w-6 h-6 text-accent-blue" />;
      case 'flood':
        return <Droplets className="w-6 h-6 text-accent-blue" />;
      default:
        return <AlertCircle className="w-6 h-6 text-accent-red" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'catastrophic':
        return 'text-accent-red';
      case 'severe':
        return 'text-accent-orange';
      case 'moderate':
        return 'text-accent-orange';
      default:
        return 'text-accent-blue';
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Disaster to Assist</DialogTitle>
          <DialogDescription>
            Choose which disaster you'd like to provide help for. You'll see help requests and resources for that area.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-4">
          {disasters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No active disasters available</p>
            </div>
          ) : (
            disasters.map((disaster) => (
              <Card
                key={disaster.id}
                className="cursor-pointer hover:border-accent-green/50 transition-colors"
                onClick={() => onSelect(disaster.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-background-primary">
                      {getIcon(disaster.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{disaster.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span>{disaster.location}</span>
                          <span>•</span>
                          <span>{format(disaster.date, 'MMM d, yyyy')}</span>
                          <span>•</span>
                          <span className={getSeverityColor(disaster.severity)}>
                            {disaster.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-2 text-gray-500">
                          Affected radius: ~{disaster.affectedRadius}km
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
