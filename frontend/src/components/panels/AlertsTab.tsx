import { mockAlerts } from '@/data/mock-alerts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AlertsTab() {
  return (
    <div className="space-y-3">
      {mockAlerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="glass p-6 rounded-xl border border-white/10">
            <Info className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
            <p className="text-gray-400 font-medium">No active alerts</p>
          </div>
        </div>
      ) : (
        mockAlerts.map((alert) => (
          <Card
            key={alert.id}
            className={`group cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
              alert.severity === 'critical'
                ? 'border-accent-red/30 bg-gradient-to-br from-accent-red/10 to-accent-red/5 hover:border-accent-red/50 hover:shadow-lg hover:shadow-accent-red/20'
                : 'border-accent-orange/30 bg-gradient-to-br from-accent-orange/10 to-accent-orange/5 hover:border-accent-orange/50 hover:shadow-lg hover:shadow-accent-orange/20'
            }`}
          >
            {/* Animated background texture */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              alert.severity === 'critical'
                ? 'bg-gradient-to-r from-accent-red/5 via-transparent to-accent-red/5'
                : 'bg-gradient-to-r from-accent-orange/5 via-transparent to-accent-orange/5'
            }`} />

            {/* Severity indicator bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              alert.severity === 'critical' ? 'bg-accent-red' : 'bg-accent-orange'
            } shadow-lg ${
              alert.severity === 'critical' ? 'shadow-accent-red/50' : 'shadow-accent-orange/50'
            }`} />

            <CardHeader className="relative pb-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 ${
                    alert.severity === 'critical'
                      ? 'bg-gradient-to-br from-accent-red/30 to-accent-red/20 border border-accent-red/30'
                      : 'bg-gradient-to-br from-accent-orange/30 to-accent-orange/20 border border-accent-orange/30'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 drop-shadow-lg ${
                      alert.severity === 'critical' ? 'text-accent-red' : 'text-accent-orange'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-bold text-white group-hover:text-white/90 transition-colors">
                    {alert.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400 mt-1.5 font-medium">
                    {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <p className="text-sm text-gray-300 leading-relaxed">{alert.message}</p>
              {alert.expiresAt && (
                <div className={`mt-3 pt-3 border-t ${
                  alert.severity === 'critical' ? 'border-accent-red/20' : 'border-accent-orange/20'
                }`}>
                  <p className="text-xs text-gray-400 font-medium">
                    ⏱️ Expires: {formatDistanceToNow(alert.expiresAt, { addSuffix: true })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
