import { Activity, Bell, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  return (
    <header className="glass border-b border-border/50 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-status-healthy animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Operations Center</h1>
              <p className="text-xs text-muted-foreground">Predictive Process Simulation</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <Activity className="w-4 h-4 text-status-healthy" />
            <span className="text-sm font-medium">Live</span>
            <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse-glow" />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-critical text-[10px] flex items-center justify-center font-medium">3</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
