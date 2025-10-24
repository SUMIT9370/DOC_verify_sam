'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import AuthGuard from './auth-guard';
import { Skeleton } from './ui/skeleton';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isAdminLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isAdminLoading, router]);

  if (isAdminLoading || !isAdmin) {
    return (
        <div className="flex h-screen w-full items-center justify-center space-y-4 flex-col">
            <p>Verifying administrator access...</p>
            <div className='w-1/2'>
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
    );
  }

  return <AuthGuard>{children}</AuthGuard>;
}
