import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, CheckCircle, Clock, FileScan, XCircle } from 'lucide-react';

const stats = [
  {
    title: 'Documents Verified',
    value: '0',
    change: 'No data yet',
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
  },
  {
    title: 'Pending Review',
    value: '0',
    change: 'No data yet',
    icon: <Clock className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: 'Fakes Detected',
    value: '0',
    change: 'No data yet',
    icon: <XCircle className="h-6 w-6 text-red-500" />,
  },
];

export default function DashboardPage() {
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
          <CardDescription>Your most recent document verifications will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center p-10">
                <p className="text-muted-foreground">No recent activity to display.</p>
                <p className="text-sm text-muted-foreground">Verify a document to get started.</p>
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
