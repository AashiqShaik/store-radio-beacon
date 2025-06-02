
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const MasterClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-slate-800/80">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Clock className="h-5 w-5 text-blue-400" />
          <div>
            <div className="text-white text-lg font-mono font-bold">
              {formatTime(currentTime)}
            </div>
            <div className="text-slate-400 text-xs">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
