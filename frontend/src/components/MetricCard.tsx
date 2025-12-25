import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  status?: 'healthy' | 'warning' | 'critical' | 'info';
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = 'info',
  className
}: MetricCardProps) => {
  const statusColors = {
    healthy: 'text-status-healthy',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
    info: 'text-status-info'
  };
  
  const statusBg = {
    healthy: 'bg-status-healthy/10',
    warning: 'bg-status-warning/10',
    critical: 'bg-status-critical/10',
    info: 'bg-status-info/10'
  };
  
  return (
    <div className={cn(
      'glass rounded-xl p-5 transition-all duration-300 hover:border-border animate-fade-in',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        {Icon && (
          <div className={cn('p-2 rounded-lg', statusBg[status])}>
            <Icon className={cn('w-4 h-4', statusColors[status])} />
          </div>
        )}
      </div>
      
      <div className={cn('text-3xl font-bold tracking-tight mb-1', statusColors[status])}>
        {value}
      </div>
      
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
      
      {trend && (
        <div className={cn(
          'flex items-center gap-1 mt-3 text-sm font-medium',
          trend.value >= 0 ? 'text-status-healthy' : 'text-status-critical'
        )}>
          <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="text-muted-foreground font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  );
};
