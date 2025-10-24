'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
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
import { Inbox, BookCopy } from 'lucide-react';

type DocumentMaster = {
  id: string;
  studentName: string;
  universityName: string;
  degreeName: string;
  dateOfIssue: string;
};

export function MasterDocumentList() {
  const firestore = useFirestore();

  const mastersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'document_masters'),
      orderBy('studentName', 'asc')
    );
  }, [firestore]);

  const { data: masters, isLoading } = useCollection<DocumentMaster>(mastersQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issued Document Masters</CardTitle>
        <CardDescription>
          A list of all master educational documents currently in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Degree</TableHead>
                <TableHead className="text-right">Date of Issue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && masters && masters.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.studentName}</TableCell>
                  <TableCell>{doc.universityName}</TableCell>
                  <TableCell>{doc.degreeName}</TableCell>
                  <TableCell className="text-right">{doc.dateOfIssue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && (!masters || masters.length === 0) && (
            <div className="text-center p-10">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Masters Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Issue a new document master using one of the forms above.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
