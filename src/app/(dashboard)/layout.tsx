'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/lib/providers/query-provider';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (!session?.user) {
    return null;
  }

  // Get subscription tier from session (you'll need to add this to session in next iteration)
  const subscriptionTier = 'FREE'; // Placeholder - will fetch from trainer data later

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <DashboardSidebar
          subscriptionTier={subscriptionTier}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="lg:pl-64">
          {/* Header */}
          <DashboardHeader
            user={{
              name: session.user.name || 'User',
              email: session.user.email || '',
              profilePhoto: null, // Will add this later
            }}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  );
}
