'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardSidebarProps {
  subscriptionTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    name: 'Bookings',
    href: '/dashboard/bookings',
    icon: BookOpen,
  },
  {
    name: 'Page Builder',
    href: '/dashboard/page-builder',
    icon: FileText,
  },
  {
    name: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardSidebar({
  subscriptionTier,
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const tierColors = {
    FREE: 'bg-gray-100 text-gray-700',
    PRO: 'bg-blue-100 text-blue-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700',
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TrainerDesk</span>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Subscription Tier & Upgrade CTA */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          {/* Current Plan Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Plan</span>
            <Badge className={cn('text-xs', tierColors[subscriptionTier])}>
              {subscriptionTier}
            </Badge>
          </div>

          {/* Upgrade CTA for Free Users */}
          {subscriptionTier === 'FREE' && (
            <Button className="w-full" size="sm" asChild>
              <Link href="/dashboard/settings/billing">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
