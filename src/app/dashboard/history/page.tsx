'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from '@/components/ui/skeleton';
import { File, Inbox, ZoomIn } from 'lucide-react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { ReVerificationDialog } from './re-verification-dialog';
import { useState } from 'react';

type VerificationHistoryItem = {
    id: string;
    documentName: string;
    isAuthentic: boolean;
    verificationDetails: string;
    documentUrl: string; // Now a Base64 Data URI
    timestamp: {
        seconds: number;
        nanoseconds: number;
    };
};

export default function HistoryPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [reverifyItem, setReverifyItem] = useState<VerificationHistoryItem | null>(null);


    const historyQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(
            collection(firestore, 'users', user.uid, 'verification_history'),
            orderBy('timestamp', 'desc')
        );
    }, [firestore, user?.uid]);

    const { data: historyData, isLoading } = useCollection<VerificationHistoryItem>(historyQuery);

    const formatDate = (timestamp: VerificationHistoryItem['timestamp']) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp.seconds * 1000);
        return format(date, "PPP p");
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Verification History</h1>
                <p className="text-muted-foreground">
                    Browse and search through all your past document verifications.
                </p>
            </div>

            <div className="border rounded-lg shadow-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document</TableHead>
                            <TableHead className="w-[150px]">Status</TableHead>
                            <TableHead className="text-right w-[220px]">Verification Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-36 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && historyData && historyData.length > 0 && historyData.map((item) => (
                            <Dialog key={item.id}>
                                <DialogTrigger asChild>
                                    <TableRow className="cursor-pointer">
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <File className="h-4 w-4 text-muted-foreground" />
                                            {item.documentName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.isAuthentic ? 'default' : 'destructive'} className={item.isAuthentic ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                {item.isAuthentic ? 'Authentic' : 'Fake Detected'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">{formatDate(item.timestamp)}</TableCell>
                                    </TableRow>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>{item.documentName}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Verification Details</h4>
                                            <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{item.verificationDetails}</p>
                                             <h4 className="font-semibold">Status</h4>
                                             <Badge variant={item.isAuthentic ? 'default' : 'destructive'} className={item.isAuthentic ? 'bg-green-600' : ''}>
                                                {item.isAuthentic ? 'Authentic' : 'Fake Detected'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Document Image</h4>
                                            <div 
                                                className="relative aspect-square border rounded-md bg-white p-2 group cursor-pointer"
                                                onClick={() => setReverifyItem(item)}
                                            >
                                                <Image src={item.documentUrl} alt={item.documentName} layout="fill" objectFit="contain" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ZoomIn className="h-10 w-10 text-white" />
                                                    <span className="ml-2 text-white font-semibold">Zoom & Re-verify</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && (!historyData || historyData.length === 0) && (
                     <div className="text-center p-10">
                        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No History Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            You haven&apos;t verified any documents yet.
                        </p>
                    </div>
                )}
            </div>
            {reverifyItem && (
                 <ReVerificationDialog 
                    isOpen={!!reverifyItem} 
                    onClose={() => setReverifyItem(null)} 
                    item={reverifyItem} 
                />
            )}
        </div>
    );
}
