
import { LayoutList, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewSwitcherProps {
  view: 'list' | 'detailed';
  onViewChange: (view: 'list' | 'detailed') => void;
}

export const ViewSwitcher = ({ view, onViewChange }: ViewSwitcherProps) => {
  return (
    <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
      <Button
        size="sm"
        variant={view === 'list' ? 'default' : 'ghost'}
        onClick={() => onViewChange('list')}
        className={`px-3 py-2 ${
          view === 'list' 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
      >
        <LayoutList className="h-4 w-4 mr-2" />
        List
      </Button>
      <Button
        size="sm"
        variant={view === 'detailed' ? 'default' : 'ghost'}
        onClick={() => onViewChange('detailed')}
        className={`px-3 py-2 ${
          view === 'detailed' 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
      >
        <LayoutDashboard className="h-4 w-4 mr-2" />
        Detailed
      </Button>
    </div>
  );
};
