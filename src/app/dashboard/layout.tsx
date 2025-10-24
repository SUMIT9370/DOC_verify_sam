'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileScan,
  History,
  User,
  LogOut,
  Settings,
  Shield,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { GovIndiaLogo } from '@/components/icons/gov-india-logo';
import { useAuth, useUser } from '@/firebase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AuthGuard from '@/components/auth-guard';
import { useAdmin } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { isAdmin, isAdminLoading } = useAdmin();

  const baseMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/verify', label: 'Verify Documents', icon: FileScan },
    { href: '/dashboard/history', label: 'History', icon: History },
  ];

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/');
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const renderMenu = () => {
    if (isAdminLoading) {
      return (
        <>
          {baseMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full">
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <div className='w-full'>
                <div className='flex items-center gap-2 rounded-md p-2 text-left text-sm'>
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
          </SidebarMenuItem>
        </>
      );
    }

    const menuItems = [...baseMenuItems];
    if (isAdmin) {
      menuItems.push({ href: '/admin', label: 'Admin', icon: Shield });
    }

    return menuItems.map((item) => (
      <SidebarMenuItem key={item.href}>
        <Link href={item.href} className="w-full">
          <SidebarMenuButton
            isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
            tooltip={{ children: item.label, side: 'right' }}
          >
            <item.icon />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    ));
  };

  return (
    <AuthGuard>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <GovIndiaLogo className="h-8 w-8 shrink-0 text-sidebar-primary" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold font-headline text-sidebar-foreground">
                  DuckVerify
                </h2>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {renderMenu()}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard/profile" className="w-full">
                  <SidebarMenuButton  isActive={pathname.startsWith('/dashboard/profile')} tooltip={{ children: 'Profile', side: 'right' }}>
                    <User />
                    <span>Profile</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Logout', side: 'right' }}>
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-40">
            <SidebarTrigger />
            <div className='flex items-center gap-4'>
              <Button variant="ghost" size="icon"><Settings /></Button>
              <ThemeToggle />
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
