import { useState } from 'react';
import { Play, RotateCcw, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SimulationControlsProps {
  onRunSimulation: (hours: number) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const SimulationControls = ({ 
  onRunSimulation, 
  onReset,
  isLoading = false 
}: SimulationControlsProps) => {
  const [forecastHours, setForecastHours] = useState([8]);
  
  return (
    <div className="glass rounded-xl p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Simulation Controls</h3>
          <p className="text-sm text-muted-foreground">Configure and run predictive simulation</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Forecast Horizon</span>
            </div>
            <span className="text-sm font-bold text-primary">{forecastHours[0]} hours</span>
          </div>
          <Slider
            value={forecastHours}
            onValueChange={setForecastHours}
            min={1}
            max={24}
            step={1}
            className="[&>span:first-child]:bg-secondary [&>span:first-child>span]:bg-primary"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>1h</span>
            <span>12h</span>
            <span>24h</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            className={cn(
              'flex-1 gap-2 gradient-primary text-primary-foreground border-0',
              'transition-all duration-300 hover:scale-[1.02]'
            )}
            onClick={() => onRunSimulation(forecastHours[0])}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Simulation
          </Button>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={onReset}
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
