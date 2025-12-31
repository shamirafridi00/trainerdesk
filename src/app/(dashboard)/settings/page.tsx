import Link from 'next/link';
import { User, Bell, Globe, CreditCard, Users, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const settingsSections = [
  {
    title: 'Profile',
    description: 'Manage your personal information and profile photo',
    icon: User,
    href: '/dashboard/settings/profile',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Booking Preferences',
    description: 'Set your availability, booking rules, and session types',
    icon: Globe,
    href: '/dashboard/settings/booking',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Notifications',
    description: 'Configure email and SMS notification preferences',
    icon: Bell,
    href: '/dashboard/settings/notifications',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Billing',
    description: 'Manage your subscription and payment methods',
    icon: CreditCard,
    href: '/dashboard/settings/billing',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Team',
    description: 'Invite and manage sub-trainers (Pro/Enterprise only)',
    icon: Users,
    href: '/dashboard/settings/team',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    title: 'Security',
    description: 'Update password and manage security settings',
    icon: Shield,
    href: '/dashboard/settings/security',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-lg ${section.bgColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
