import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  value: number;
  thresholds?: { warning: number; critical: number };
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export const StatusIndicator = ({
  value,
  thresholds = { warning: 60, critical: 80 },
  size = 'md',
  showLabel = true,
  label
}: StatusIndicatorProps) => {
  const status = value >= thresholds.critical 
    ? 'critical' 
    : value >= thresholds.warning 
    ? 'warning' 
    : 'healthy';
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  const statusClasses = {
    healthy: 'bg-status-healthy',
    warning: 'bg-status-warning',
    critical: 'bg-status-critical'
  };
  
  const glowClasses = {
    healthy: 'glow-primary',
    warning: 'glow-warning',
    critical: 'glow-critical'
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'rounded-full animate-pulse-glow',
        sizeClasses[size],
        statusClasses[status],
        glowClasses[status]
      )} />
      {showLabel && (
        <span className={cn(
          'text-sm font-medium capitalize',
          status === 'healthy' && 'text-status-healthy',
          status === 'warning' && 'text-status-warning',
          status === 'critical' && 'text-status-critical'
        )}>
          {label || status}
        </span>
      )}
    </div>
  );
};
