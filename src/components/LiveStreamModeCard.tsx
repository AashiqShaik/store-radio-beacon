
import { Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LiveStreamModeCard = () => {
  return (
    <Card className="bg-slate-800/80">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Music className="h-5 w-5" />
          <span>Live Stream Mode</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm">
          Device is in Live Stream mode. Enable Store Mode to access content scheduling and upload features.
        </p>
      </CardContent>
    </Card>
  );
};
