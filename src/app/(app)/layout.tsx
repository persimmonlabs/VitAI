'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth';
import { QueryProvider } from '@/lib/query';
import { BottomNav } from '@/components/organisms/BottomNav';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <AuthGuard>
          <div className="flex min-h-screen flex-col bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white shadow-sm">
              <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
                <h1 className="text-xl font-bold text-primary">VitAI</h1>
                <div className="flex items-center gap-2">
                  {/* Notifications or profile icon can go here */}
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 pb-20 md:pb-4">
              {children}
            </main>

            {/* Bottom navigation for mobile */}
            <BottomNav />
          </div>
        </AuthGuard>
      </QueryProvider>
    </AuthProvider>
  );
}
