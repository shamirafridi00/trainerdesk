import Link from 'next/link';
import { Calendar, FileText, Eye, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  subscriptionTier: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export function QuickActions({ subscriptionTier }: QuickActionsProps) {
  const actions = [
    {
      label: 'Create Booking',
      href: '/dashboard/bookings/new',
      icon: Calendar,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      label: 'Edit Page',
      href: '/dashboard/page-builder',
      icon: FileText,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      label: 'View Page',
      href: '/preview', // Will be trainer's public page
      icon: Eye,
      color: 'bg-green-600 hover:bg-green-700',
      external: true,
    },
    {
      label: 'Invite Sub-Trainer',
      href: '/dashboard/settings/team',
      icon: UserPlus,
      color: 'bg-orange-600 hover:bg-orange-700',
      disabled: subscriptionTier === 'FREE',
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isDisabled = action.disabled || false;

          if (isDisabled) {
            return (
              <Button
                key={action.label}
                disabled
                className="h-auto py-4 flex-col gap-2"
                variant="outline"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
                <span className="text-xs text-gray-500">(Pro/Enterprise)</span>
              </Button>
            );
          }

          return (
            <Button
              key={action.label}
              asChild
              className={`h-auto py-4 flex-col gap-2 text-white ${action.color}`}
            >
              <Link
                href={action.href}
                target={action.external ? '_blank' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
