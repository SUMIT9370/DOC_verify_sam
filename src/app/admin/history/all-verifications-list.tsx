
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collectionGroup, query, orderBy, Timestamp, doc } from 'firebase/firestore';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox, File, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type VerificationHistoryItem = {
  id: string; // The ID of the history document itself
  documentName: string;
  isAuthentic: boolean;
  verificationDetails: string;
  documentUrl: string;
  timestamp: Timestamp;
  // We expect the parent user document to have these fields
  user: {
      uid: string;
      email: string;
  }
};

type UserProfile = {
    isAdmin?: boolean;
    email?: string;
}

export function AllVerificationsList() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  const isAdmin = !isProfileLoading && userProfile?.isAdmin === true;

  const verificationsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    // collectionGroup query to get all verification_history docs
    return query(
      collectionGroup(firestore, 'verification_history'),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, isAdmin]);

  const { data: verifications, isLoading: isVerificationsLoading } = useCollection<VerificationHistoryItem>(verificationsQuery);

  const isLoading = isUserLoading || isProfileLoading || (isAdmin && isVerificationsLoading);

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'PPP p');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Verifications</CardTitle>
        <CardDescription>
          Live feed of all verifications happening on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && verifications && verifications.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" />
                    {item.documentName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.user?.email || 'Unknown User'}</TableCell>
                   <TableCell>
                      <Badge variant={item.isAuthentic ? 'default' : 'destructive'} className={item.isAuthentic ? 'bg-green-600 hover:bg-green-700' : ''}>
                          {item.isAuthentic ? <ShieldCheck className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                          {item.isAuthentic ? 'Authentic' : 'Fake'}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatDate(item.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && (!verifications || verifications.length === 0) && (
            <div className="text-center p-10">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Verifications Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAdmin ? "No users have verified any documents yet." : "You do not have permission to view verification history."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
