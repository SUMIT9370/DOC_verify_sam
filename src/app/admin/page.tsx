
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MasterUploader } from "./components/master-uploader";
import { IssueDocumentForm } from "./components/issue-document-form";
import { Button } from '@/components/ui/button';
import { BookUser, FileCheck2, FileUp, History, Users } from 'lucide-react';
import { MasterDocumentList } from './components/master-document-list';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

export default function AdminPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [stats, setStats] = useState({ masters: 0, verifications: 0, users: 0 });
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    useEffect(() => {
        const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated');
        if (isAdminAuthenticated !== 'true') {
            router.push('/admin/login');
        }
    }, [router]);
    
    // Fetch stats once the user is confirmed to be an admin
    useEffect(() => {
        if (user && firestore) {
            const fetchStats = async () => {
                setIsStatsLoading(true);
                try {
                    const mastersQuery = query(collection(firestore, 'document_masters'));
                    const verificationsQuery = query(collection(firestore, 'users')); // A proxy for total verifications for now
                    const usersQuery = query(collection(firestore, 'users'));
                    
                    const [mastersSnap, verificationsSnap, usersSnap] = await Promise.all([
                        getCountFromServer(mastersQuery),
                        getCountFromServer(verificationsQuery),
                        getCountFromServer(usersQuery)
                    ]);

                    setStats({
                        masters: mastersSnap.data().count,
                        verifications: verificationsSnap.data().count * 5, // Placeholder logic
                        users: usersSnap.data().count
                    });
                } catch (error) {
                    console.error("Error fetching admin stats:", error);
                }
                setIsStatsLoading(false);
            };

            // Simple check, assuming admin status is verified by login route
            fetchStats();
        }
    }, [user, firestore]);

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        router.push('/admin/login');
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold font-headline">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            System-wide monitoring and database management.
                        </p>
                    </div>
                    <Button onClick={handleLogout} variant="outline">Logout</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Issued Masters</CardTitle>
                            <BookUser className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isStatsLoading ? '...' : stats.masters}</div>
                             <p className="text-xs text-muted-foreground">Total master templates in DB</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isStatsLoading ? '...' : stats.users}</div>
                             <p className="text-xs text-muted-foreground">Total registered users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">All Verification History</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isStatsLoading ? '...' : stats.verifications}+</div>
                             <Button size="sm" variant="outline" className="mt-1" asChild>
                                <Link href="/admin/history">View History</Link>
                             </Button>
                        </CardContent>
                    </Card>
                </div>

                <MasterDocumentList />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI-Powered Master Upload</CardTitle>
                            <CardDescription>
                                Upload a document image. The AI will extract the data and save it as a master template.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MasterUploader />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Issue New Document Manually</CardTitle>
                            <CardDescription>
                                Fill out the form to create a new master document record in the database.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IssueDocumentForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
