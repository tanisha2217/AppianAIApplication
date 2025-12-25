import { Suggestion } from '@/types/operations';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onApply?: (suggestion: Suggestion) => void;
  delay?: number;
}

export const SuggestionCard = ({ suggestion, onApply, delay = 0 }: SuggestionCardProps) => {
  const icons = {
    high: AlertTriangle,
    medium: AlertCircle,
    low: Info
  };
  
  const Icon = icons[suggestion.severity];
  
  const severityStyles = {
    high: {
      bg: 'bg-status-critical/10',
      border: 'border-status-critical/30',
      text: 'text-status-critical',
      glow: 'hover:glow-critical'
    },
    medium: {
      bg: 'bg-status-warning/10',
      border: 'border-status-warning/30',
      text: 'text-status-warning',
      glow: 'hover:glow-warning'
    },
    low: {
      bg: 'bg-status-info/10',
      border: 'border-status-info/30',
      text: 'text-status-info',
      glow: 'hover:glow-primary'
    }
  };
  
  const styles = severityStyles[suggestion.severity];
  
  return (
    <div 
      className={cn(
        'glass rounded-xl p-5 transition-all duration-300 animate-slide-in-right',
        styles.border,
        styles.glow
      )}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={cn('p-2.5 rounded-lg', styles.bg)}>
          <Icon className={cn('w-5 h-5', styles.text)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-semibold uppercase tracking-wide', styles.text)}>
              {suggestion.severity} priority
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{suggestion.queue}</span>
          </div>
          
          <h4 className="font-semibold text-lg mb-2">{suggestion.action}</h4>
          
          <p className="text-sm text-muted-foreground mb-3">
            {suggestion.reasoning}
          </p>
          
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">{suggestion.impact}</span>
          </div>
        </div>
        
        {suggestion.resourceChange && onApply && (
          <Button
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => onApply(suggestion)}
          >
            Apply
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
