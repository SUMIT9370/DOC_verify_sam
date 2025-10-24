'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!auth || !firestore) {
      setError('Firebase is not initialized. Please try again later.');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data()?.isAdmin === true) {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        toast({
          title: 'Login Successful',
          description: 'Redirecting to the admin dashboard.',
        });
        router.push('/admin');
      } else {
        setError('You do not have permission to access the admin area.');
        await auth.signOut();
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        console.error('Admin Login Error:', error);
        setError('An unexpected error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!auth || !resetEmail) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address to reset your password.',
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: 'Password Reset Email Sent',
        description: `An email has been sent to ${resetEmail} with instructions to reset your password.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Email',
        description: 'Could not send password reset email. Please check the address and try again.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="bg-white rounded-full p-1">
            <Image src="/logo.png" alt="DocVerify Logo" width={40} height={40} />
          </div>
          <span className="text-2xl font-bold font-headline">DocVerify Admin</span>
        </div>
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-headline">Administrator Access</CardTitle>
            <CardDescription>
              Enter your credentials to manage the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="sumit.admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <button type="button" onClick={() => setResetEmail(email)} className="text-xs text-primary hover:underline">Forgot Password?</button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Your Password</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter your email address below and we will send you a link to reset your password.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          placeholder="sumit.admin@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          type="email"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePasswordReset}>Send Reset Link</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
