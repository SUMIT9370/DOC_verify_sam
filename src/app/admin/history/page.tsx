
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AllVerificationsList } from './all-verifications-list';

export default function AdminHistoryPage() {
    const router = useRouter();

    useEffect(() => {
        const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated');
        if (isAdminAuthenticated !== 'true') {
            router.push('/admin/login');
        }
    }, [router]);


    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">All User Verifications</h1>
                    <p className="text-muted-foreground">
                        A centralized log of every verification performed across the platform.
                    </p>
                </div>
                <AllVerificationsList />
            </div>
        </div>
    );
}
