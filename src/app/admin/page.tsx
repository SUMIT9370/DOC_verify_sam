'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MasterUploader } from "./components/master-uploader";
import { IssueDocumentForm } from "./components/issue-document-form";
import { Button } from '@/components/ui/button';
import { BookUser, FileCheck2, FileUp } from 'lucide-react';
import { MasterDocumentList } from './components/master-document-list';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated');
        if (isAdminAuthenticated !== 'true') {
            router.push('/admin/login');
        }
    }, [router]);

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Verified Documents (Today)</CardTitle>
                            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">23,498</div>
                            <p className="text-xs text-muted-foreground">+12.5% from last week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Issued Masters (All Time)</CardTitle>
                            <BookUser className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,230</div>
                             <p className="text-xs text-muted-foreground">+50 since last month</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Verifications (All Time)</CardTitle>
                            <FileUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">6.2 Billion+</div>
                             <p className="text-xs text-muted-foreground">Across 2,500+ institutions</p>
                        </CardContent>
                    </Card>
                </div>
                
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
