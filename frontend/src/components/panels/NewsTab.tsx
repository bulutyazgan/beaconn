import { mockNews } from '@/data/mock-news';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Newspaper, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NewsTab() {
  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 drop-shadow-lg text-accent-red" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 drop-shadow-lg text-accent-orange" />;
      default:
        return <Info className="w-5 h-5 drop-shadow-lg text-accent-blue" />;
    }
  };

  const getCardStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          card: 'border-accent-red/30 bg-gradient-to-br from-accent-red/10 to-accent-red/5 hover:border-accent-red/50 hover:shadow-lg hover:shadow-accent-red/20',
          texture: 'bg-gradient-to-r from-accent-red/5 via-transparent to-accent-red/5',
          indicator: 'bg-accent-red shadow-accent-red/50',
          icon: 'bg-gradient-to-br from-accent-red/30 to-accent-red/20 border border-accent-red/30',
        };
      case 'warning':
        return {
          card: 'border-accent-orange/30 bg-gradient-to-br from-accent-orange/10 to-accent-orange/5 hover:border-accent-orange/50 hover:shadow-lg hover:shadow-accent-orange/20',
          texture: 'bg-gradient-to-r from-accent-orange/5 via-transparent to-accent-orange/5',
          indicator: 'bg-accent-orange shadow-accent-orange/50',
          icon: 'bg-gradient-to-br from-accent-orange/30 to-accent-orange/20 border border-accent-orange/30',
        };
      default:
        return {
          card: 'border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 hover:border-accent-blue/50 hover:shadow-lg hover:shadow-accent-blue/20',
          texture: 'bg-gradient-to-r from-accent-blue/5 via-transparent to-accent-blue/5',
          indicator: 'bg-accent-blue shadow-accent-blue/50',
          icon: 'bg-gradient-to-br from-accent-blue/30 to-accent-blue/20 border border-accent-blue/30',
        };
    }
  };

  return (
    <div className="space-y-3">
      {mockNews.length === 0 ? (
        <div className="text-center py-12">
          <div className="glass p-6 rounded-xl border border-white/10">
            <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
            <p className="text-gray-400 font-medium">No news updates</p>
          </div>
        </div>
      ) : (
        mockNews.map((news) => {
          const styles = getCardStyles(news.severity);
          return (
            <Card
              key={news.id}
              className={`group cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${styles.card}`}
            >
              {/* Animated background texture */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${styles.texture}`} />

              {/* Severity indicator bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.indicator} shadow-lg`} />

              <CardHeader className="relative pb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 ${styles.icon}`}
                  >
                    {getIcon(news.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold text-white group-hover:text-white/90 transition-colors">
                      {news.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-400 mt-1.5 font-medium">
                      {news.source} • {formatDistanceToNow(news.timestamp, { addSuffix: true })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <p className="text-sm text-gray-300 leading-relaxed">{news.content}</p>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
