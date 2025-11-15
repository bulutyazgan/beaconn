import { mockNews } from '@/data/mock-news';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Newspaper, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NewsTab() {
  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 relative z-10 text-purple-400 drop-shadow-lg" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 relative z-10 text-blue-400 drop-shadow-lg" />;
      default:
        return <Info className="w-5 h-5 relative z-10 text-blue-300 drop-shadow-lg" />;
    }
  };

  return (
    <div className="space-y-4">
      {mockNews.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 rounded-2xl border border-white/10 backdrop-blur-xl">
            <Newspaper className="w-12 h-12 mx-auto mb-3 text-blue-400/50" />
            <p className="text-slate-300 font-medium">No news updates</p>
          </div>
        </div>
      ) : (
        mockNews.map((news) => {
          return (
            <Card
              key={news.id}
              className="group cursor-pointer relative overflow-hidden transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-0 shadow-2xl hover:shadow-purple-500/20"
            >
              {/* Multi-layer gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-black/20" />

              {/* Animated shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              {/* Left gradient accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 via-purple-500 to-blue-600 shadow-lg shadow-purple-500/50" />

              <CardHeader className="relative pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon with gradient background */}
                  <div className="relative p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-purple-400/30 shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-500/40">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
                    {getIcon(news.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:via-white group-hover:to-blue-300 transition-all duration-300">
                      {news.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-2 font-medium">
                      {news.source} • {formatDistanceToNow(news.timestamp, { addSuffix: true })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative pt-0">
                <p className="text-sm text-slate-300 leading-relaxed">{news.content}</p>
              </CardContent>

              {/* Bottom gradient accent */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            </Card>
          );
        })
      )}
    </div>
  );
}
