import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
