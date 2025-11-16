
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MasterUploader } from "./components/master-uploader";
import { IssueDocumentForm } from "./components/issue-document-form";
import { Button } from '@/components/ui/button';
import { BookUser, History, Users } from 'lucide-react';
import { MasterDocumentList } from './components/master-document-list';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, getCountFromServer, doc, collectionGroup } from 'firebase/firestore';

type UserProfile = {
    isAdmin?: boolean;
}

export default function AdminPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    // State to hold the definitive admin status
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
    
    // State for stats
    const [stats, setStats] = useState({ masters: 0, verifications: 0, users: 0 });
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    // Get the user's profile to check for isAdmin flag
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
        const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated');
        if (isAdminAuthenticated !== 'true') {
            router.push('/admin/login');
        }
    }, [router]);

    // This effect runs once to determine the user's admin status.
    useEffect(() => {
        if (!isUserLoading && !isProfileLoading) {
            const adminStatus = userProfile?.isAdmin === true;
            setIsAdmin(adminStatus);
            setIsCheckingAdmin(false);
        }
    }, [isUserLoading, isProfileLoading, userProfile]);
    
    // This effect runs ONLY AFTER the admin check is complete.
    useEffect(() => {
        if (isCheckingAdmin) return; // Do not run if we are still checking for admin status

        if (isAdmin && firestore) {
            const fetchStats = async () => {
                setIsStatsLoading(true);
                try {
                    const mastersQuery = query(collection(firestore, 'document_masters'));
                    const verificationsQuery = query(collectionGroup(firestore, 'verification_history'));
                    const usersQuery = query(collection(firestore, 'users'));
                    
                    const [mastersSnap, verificationsSnap, usersSnap] = await Promise.all([
                        getCountFromServer(mastersQuery),
                        getCountFromServer(verificationsQuery),
                        getCountFromServer(usersQuery)
                    ]);

                    setStats({
                        masters: mastersSnap.data().count,
                        verifications: verificationsSnap.data().count,
                        users: usersSnap.data().count
                    });
                } catch (error) {
                    console.error("Error fetching admin stats:", error);
                } finally {
                    setIsStatsLoading(false);
                }
            };
            fetchStats();
        } else {
            // If user is not an admin, we're done loading stats (they are 0).
            setIsStatsLoading(false);
        }
    }, [isAdmin, isCheckingAdmin, firestore]);

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        router.push('/admin/login');
    }

    const isLoading = isUserLoading || isCheckingAdmin || isStatsLoading;

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
                            <div className="text-2xl font-bold">{isLoading ? '...' : stats.masters}</div>
                             <p className="text-xs text-muted-foreground">Total master templates in DB</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading ? '...' : stats.users}</div>
                             <p className="text-xs text-muted-foreground">Total registered users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Platform Verifications</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading ? '...' : stats.verifications}</div>
                             <Button size="sm" variant="outline" className="mt-1" asChild>
                                <Link href="/admin/history">View History</Link>
                             </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* ** FIX: Pass isAdmin prop and only render after check is complete ** */}
                { !isCheckingAdmin && <MasterDocumentList isAdmin={isAdmin} /> }
                
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
