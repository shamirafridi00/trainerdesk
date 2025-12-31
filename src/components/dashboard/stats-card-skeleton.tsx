import { Card } from '@/components/ui/card';

export function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </Card>
  );
}
