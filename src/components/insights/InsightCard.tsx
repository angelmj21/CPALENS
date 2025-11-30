import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Insight } from '@/types';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight: Insight;
}

const InsightCard = ({ insight }: InsightCardProps) => {
  const icons = {
    positive: CheckCircle,
    warning: AlertCircle,
    info: Info,
  };
  
  const colors = {
    positive: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
  };
  
  const bgColors = {
    positive: 'bg-success/10',
    warning: 'bg-warning/10',
    info: 'bg-info/10',
  };
  
  const Icon = icons[insight.type];
  
  return (
    <Card className="card-elevated p-6">
      <div className="flex gap-4">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', bgColors[insight.type])}>
          <Icon className={cn('h-6 w-6', colors[insight.type])} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold">{insight.title}</h3>
            {insight.badge && (
              <Badge variant="secondary" className="shrink-0">
                {insight.badge}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
        </div>
      </div>
    </Card>
  );
};

export default InsightCard;
