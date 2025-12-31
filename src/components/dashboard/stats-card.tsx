import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = 'from last month',
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-50',
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined && change !== 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {hasChange && (
                <>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isPositive ? '+' : ''}
                    {change}%
                  </span>
                </>
              )}
              <span className="text-sm text-gray-600">{changeLabel}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center',
            iconBgColor
          )}
        >
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </Card>
  );
}
