import { mockNews } from '@/data/mock-news';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Newspaper, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NewsTab() {
  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-accent-red" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-accent-orange" />;
      default:
        return <Info className="w-5 h-5 text-accent-blue" />;
    }
  };

  const getBgColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-accent-red/10';
      case 'warning':
        return 'bg-accent-orange/10';
      default:
        return 'bg-accent-blue/10';
    }
  };

  return (
    <div className="space-y-4 p-4">
      {mockNews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No news updates</p>
        </div>
      ) : (
        mockNews.map((news) => (
          <Card key={news.id} className="border-glass-border">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className={`mt-1 p-2 rounded-lg ${getBgColor(news.severity)}`}>
                  {getIcon(news.severity)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{news.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {news.source} • {formatDistanceToNow(news.timestamp, { addSuffix: true })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">{news.content}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
