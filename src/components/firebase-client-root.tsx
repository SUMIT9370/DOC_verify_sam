'use client';

import { FirebaseClientProvider } from '@/firebase';

export function FirebaseClientRoot({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        <FirebaseClientProvider>
            {children}
        </FirebaseClientProvider>
    )
}
