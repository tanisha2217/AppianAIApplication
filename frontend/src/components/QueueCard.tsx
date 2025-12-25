import { WorkQueue, QueuePrediction } from '@/types/operations';
import { cn } from '@/lib/utils';
import { Users, Clock, Layers, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface QueueCardProps {
  queue: WorkQueue;
  prediction?: QueuePrediction;
  delay?: number;
}

export const QueueCard = ({ queue, prediction, delay = 0 }: QueueCardProps) => {
  const utilization = prediction?.utilization ?? (queue.workInProgress / queue.capacity) * 100;
  const breachRisk = prediction?.slaBreachProbability ?? 0;
  
  const getStatus = () => {
    if (breachRisk >= 70 || utilization >= 90) return 'critical';
    if (breachRisk >= 40 || utilization >= 70) return 'warning';
    return 'healthy';
  };
  
  const status = getStatus();
  
  const statusGradients = {
    healthy: 'from-status-healthy/20 to-transparent',
    warning: 'from-status-warning/20 to-transparent',
    critical: 'from-status-critical/20 to-transparent'
  };
  
  const statusBorders = {
    healthy: 'border-status-healthy/30',
    warning: 'border-status-warning/30',
    critical: 'border-status-critical/30'
  };
  
  const progressColors = {
    healthy: '[&>div]:bg-status-healthy',
    warning: '[&>div]:bg-status-warning',
    critical: '[&>div]:bg-status-critical'
  };
  
  return (
    <div 
      className={cn(
        'glass rounded-xl p-5 transition-all duration-500 hover:scale-[1.02] animate-fade-in',
        'bg-gradient-to-br',
        statusGradients[status],
        statusBorders[status]
      )}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{queue.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {queue.id}</p>
        </div>
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
          status === 'healthy' && 'bg-status-healthy/20 text-status-healthy',
          status === 'warning' && 'bg-status-warning/20 text-status-warning',
          status === 'critical' && 'bg-status-critical/20 text-status-critical'
        )}>
          {status}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Utilization Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Utilization</span>
            <span className="text-sm font-semibold">{utilization.toFixed(1)}%</span>
          </div>
          <Progress value={utilization} className={cn('h-2', progressColors[status])} />
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-xs">WIP / Capacity</span>
            </div>
            <p className="text-lg font-bold">
              {prediction?.workInProgress ?? queue.workInProgress}
              <span className="text-muted-foreground font-normal">/{queue.capacity}</span>
            </p>
          </div>
          
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">Employees</span>
            </div>
            <p className="text-lg font-bold">{queue.employees}</p>
          </div>
          
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">Avg. Wait</span>
            </div>
            <p className="text-lg font-bold">
              {prediction?.avgWaitTime.toFixed(0) ?? queue.avgProcessTime}
              <span className="text-muted-foreground font-normal text-sm">m</span>
            </p>
          </div>
          
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs">SLA Risk</span>
            </div>
            <p className={cn(
              'text-lg font-bold',
              breachRisk >= 70 && 'text-status-critical',
              breachRisk >= 40 && breachRisk < 70 && 'text-status-warning',
              breachRisk < 40 && 'text-status-healthy'
            )}>
              {breachRisk.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
