'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, CheckCircle, Clock, FileScan, XCircle, Inbox, File as FileIcon } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type VerificationHistoryItem = {
    id: string;
    documentName: string;
    isAuthentic: boolean;
    verificationDetails: string;
    timestamp: {
        seconds: number;
        nanoseconds: number;
    };
};

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'verification_history'), orderBy('timestamp', 'desc'));
  }, [firestore, user?.uid]);

  const recentHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'verification_history'), orderBy('timestamp', 'desc'), limit(3));
  }, [firestore, user?.uid]);

  const { data: historyData, isLoading } = useCollection<VerificationHistoryItem>(historyQuery);
  const { data: recentHistoryData, isLoading: isRecentLoading } = useCollection<VerificationHistoryItem>(recentHistoryQuery);

  const verifiedCount = historyData?.length ?? 0;
  const fakesDetectedCount = historyData?.filter(item => !item.isAuthentic).length ?? 0;

  const stats = [
    {
      title: 'Documents Verified',
      value: isLoading ? <Skeleton className="h-8 w-20" /> : verifiedCount.toString(),
      change: 'All time',
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
    {
      title: 'Pending Review',
      value: '0',
      change: 'Feature coming soon',
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
    },
    {
      title: 'Fakes Detected',
      value: isLoading ? <Skeleton className="h-8 w-16" /> : fakesDetectedCount.toString(),
      change: 'All time',
      icon: <XCircle className="h-6 w-6 text-red-500" />,
    },
  ];

  const formatDate = (timestamp: VerificationHistoryItem['timestamp']) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return format(date, "PPP p");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your verification activity.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/verify">
            <FileScan className="mr-2 h-4 w-4" />
            Verify New Document
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest document verifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isRecentLoading && (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            )}
            {!isRecentLoading && recentHistoryData && recentHistoryData.length > 0 ? (
                recentHistoryData.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                            <p className="font-medium">{item.documentName}</p>
                        </div>
                        <div className="flex items-center gap-4">
                             <Badge variant={item.isAuthentic ? 'default' : 'destructive'} className={item.isAuthentic ? 'bg-green-600 hover:bg-green-700' : ''}>
                                {item.isAuthentic ? 'Authentic' : 'Fake Detected'}
                            </Badge>
                            <p className="text-xs text-muted-foreground font-mono hidden sm:block">{formatDate(item.timestamp)}</p>
                        </div>
                    </div>
                ))
            ) : null}

            {!isRecentLoading && (!recentHistoryData || recentHistoryData.length === 0) && (
                 <div className="text-center p-10">
                    <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Activity Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Verify a document to see your recent activity here.
                    </p>
                </div>
            )}
          </div>
          <Button variant="link" className="mt-4 p-0 h-auto">
            <Link href="/dashboard/history" className="flex items-center">
                View All History <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
