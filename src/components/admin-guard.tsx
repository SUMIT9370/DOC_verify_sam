'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import AuthGuard from './auth-guard';

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
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return <AuthGuard>{children}</AuthGuard>;
}
