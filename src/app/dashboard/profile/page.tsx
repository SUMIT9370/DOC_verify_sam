'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Mail, Building, GraduationCap, Briefcase } from 'lucide-react';

type UserProfile = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType: 'student' | 'university' | 'company';
};

export default function ProfilePage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const getInitials = (email: string | undefined | null) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };
  
  const userTypeDetails = {
    student: { icon: <GraduationCap className="h-5 w-5" />, label: 'Student' },
    university: { icon: <Building className="h-5 w-5" />, label: 'University / College' },
    company: { icon: <Briefcase className="h-5 w-5" />, label: 'Industry / Company' },
  }

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account details.
        </p>
      </div>

      <Card className="shadow-md max-w-2xl">
        <CardHeader>
            <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 text-3xl">
                    <AvatarFallback>
                        {isLoading ? <Skeleton className="h-20 w-20 rounded-full" /> : getInitials(userProfile?.email)}
                    </AvatarFallback>
                </Avatar>
                <div className='space-y-1'>
                    <CardTitle className="text-3xl">
                        {isLoading ? <Skeleton className="h-8 w-48" /> : userProfile?.displayName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        {isLoading ? <Skeleton className="h-5 w-32" /> : userProfile?.email}
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary" /> User Information</h3>
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono text-sm">{isLoading ? <Skeleton className="h-5 w-40" /> : userProfile?.uid}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">User Type:</span>
                         {isLoading ? <Skeleton className="h-6 w-24" /> : (
                            <Badge variant="secondary" className="capitalize flex items-center gap-2">
                                {userProfile && userTypeDetails[userProfile.userType]?.icon}
                                {userProfile && userTypeDetails[userProfile.userType]?.label}
                            </Badge>
                         )}
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
