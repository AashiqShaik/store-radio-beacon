
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface DeviceSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const DeviceSearch = ({ searchQuery, onSearchChange }: DeviceSearchProps) => {
  return (
    <Card className="bg-slate-800/80">
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search devices by name, location, or IP address..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
      </CardContent>
    </Card>
  );
};
