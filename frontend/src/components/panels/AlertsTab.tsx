import { mockAlerts } from '@/data/mock-alerts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AlertsTab() {
  return (
    <div className="space-y-4 p-4">
      {mockAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No active alerts</p>
        </div>
      ) : (
        mockAlerts.map((alert) => (
          <Card
            key={alert.id}
            className={`${
              alert.severity === 'critical'
                ? 'border-accent-red/50 bg-accent-red/5'
                : 'border-accent-orange/50 bg-accent-orange/5'
            }`}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 p-2 rounded-lg ${
                    alert.severity === 'critical'
                      ? 'bg-accent-red/20'
                      : 'bg-accent-orange/20'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      alert.severity === 'critical' ? 'text-accent-red' : 'text-accent-orange'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{alert.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">{alert.message}</p>
              {alert.expiresAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Expires: {formatDistanceToNow(alert.expiresAt, { addSuffix: true })}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
