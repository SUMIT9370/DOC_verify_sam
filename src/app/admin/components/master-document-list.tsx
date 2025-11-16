
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, Timestamp } from 'firebase/firestore';
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
import { Inbox, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { format } from 'date-fns';

type DocumentMaster = {
  id: string;
  documentType: string;
  documentData: Record<string, any>;
  documentDataUri?: string; // The Base64 data URI
  creatorEmail?: string;
  createdAt?: Timestamp;
};

type UserProfile = {
    isAdmin?: boolean;
}

export function MasterDocumentList() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // 1. Get the current user's profile to check for isAdmin flag
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  // 2. This flag is now the single source of truth for admin status.
  const isAdmin = !isUserLoading && !isProfileLoading && userProfile?.isAdmin === true;
  // A flag to know when we can definitively say if the user is an admin or not.
  const canAttemptQuery = !isUserLoading && !isProfileLoading;


  // 3. **CRITICAL FIX**: Only build the query if we have confirmed the user is an admin.
  // If we haven't checked yet, or if they are not an admin, this MUST return null.
  const mastersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null; // <--- The critical check
    return query(
      collection(firestore, 'document_masters'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, isAdmin]); // The dependency is now directly on the 'isAdmin' boolean.

  // 4. The hook will now only run the query if mastersQuery is not null.
  const { data: masters, isLoading: isMastersLoading } = useCollection<DocumentMaster>(mastersQuery);

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'PPP p');
  };

  // The component is in a loading state if we are still verifying the user or their profile, OR if we are an admin and the masters list is loading.
  const isLoading = isUserLoading || isProfileLoading || (isAdmin && isMastersLoading);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issued Document Masters</CardTitle>
        <CardDescription>
          A list of all master documents currently in the database, ordered by most recent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Primary Holder</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Date Issued</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && isAdmin && masters?.map((doc) => (
                <Dialog key={doc.id}>
                  <DialogTrigger asChild>
                    <TableRow className="cursor-pointer">
                      <TableCell className="font-medium">{doc.documentType}</TableCell>
                      <TableCell>{doc.documentData?.studentName || doc.documentData?.applicantName || doc.documentData?.fullName || 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">{doc.creatorEmail || 'N/A'}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatDate(doc.createdAt)}</TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{doc.documentType}</DialogTitle>
                      <DialogDescription>
                        Issued by: {doc.creatorEmail || 'Unknown'} on {formatDate(doc.createdAt)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Extracted Data</h4>
                            <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm max-h-96">
                                {JSON.stringify(doc.documentData, null, 2)}
                            </pre>
                        </div>
                        <div className="space-y-2">
                             <h4 className="font-semibold">Document Image</h4>
                             <div className="relative aspect-video rounded-md border bg-muted flex items-center justify-center">
                                {doc.documentDataUri ? (
                                    <Image src={doc.documentDataUri} alt={doc.documentType} fill className="object-contain" />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <ImageIcon className="h-10 w-10 mx-auto" />
                                        <p>No image available.</p>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </TableBody>
          </Table>
          {canAttemptQuery && !isAdmin && (
            <div className="text-center p-10">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Permission Denied</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You do not have permission to view master documents.
              </p>
            </div>
          )}
          {canAttemptQuery && isAdmin && !isMastersLoading && (!masters || masters.length === 0) && (
            <div className="text-center p-10">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Masters Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Issue a new document master using one of the forms on this page.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
