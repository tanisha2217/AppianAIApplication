import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge = ({ value, label, size = 'md' }: RiskGaugeProps) => {
  const getColor = () => {
    if (value >= 70) return 'text-status-critical';
    if (value >= 40) return 'text-status-warning';
    return 'text-status-healthy';
  };
  
  const getGradient = () => {
    if (value >= 70) return 'from-status-critical to-red-400';
    if (value >= 40) return 'from-status-warning to-amber-400';
    return 'from-status-healthy to-emerald-400';
  };
  
  const sizeClasses = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-28 h-28', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'w-36 h-36', text: 'text-3xl', label: 'text-base' }
  };
  
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
  const radius = size === 'lg' ? 60 : size === 'md' ? 48 : 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference * 0.75;
  
  return (
    <div className="flex flex-col items-center animate-scale-in">
      <div className={cn('relative', sizeClasses[size].container)}>
        <svg className="w-full h-full -rotate-135" viewBox="0 0 140 140">
          {/* Background arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference * 0.75}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference * 0.75}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={cn('stop-current', getColor())} />
              <stop offset="100%" className={cn('stop-current', getColor())} stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', sizeClasses[size].text, getColor())}>
            {value.toFixed(0)}%
          </span>
        </div>
      </div>
      
      <span className={cn('text-muted-foreground mt-2 font-medium', sizeClasses[size].label)}>
        {label}
      </span>
    </div>
  );
};
