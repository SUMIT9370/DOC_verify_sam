'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
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

type DocumentMaster = {
  id: string;
  documentType: string;
  documentData: Record<string, any>;
  documentDataUri?: string; // The Base64 data URI
};

export function MasterDocumentList() {
  const firestore = useFirestore();

  const mastersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'document_masters'),
      orderBy('documentType', 'asc')
    );
  }, [firestore]);

  const { data: masters, isLoading } = useCollection<DocumentMaster>(mastersQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issued Document Masters</CardTitle>
        <CardDescription>
          A list of all master documents currently in the database. Click a row to see details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Primary Holder</TableHead>
                <TableHead className="text-right">Extracted Fields</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && masters && masters.map((doc) => (
                <Dialog key={doc.id}>
                  <DialogTrigger asChild>
                    <TableRow className="cursor-pointer">
                      <TableCell className="font-medium">{doc.documentType}</TableCell>
                      <TableCell>{doc.documentData?.studentName || doc.documentData?.applicantName || doc.documentData?.fullName || 'N/A'}</TableCell>
                      <TableCell className="text-right">{Object.keys(doc.documentData).length}</TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{doc.documentType}</DialogTitle>
                      <DialogDescription>
                        ID: {doc.id}
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
          {!isLoading && (!masters || masters.length === 0) && (
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
