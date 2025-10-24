'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { initiateEmailSignUp, initiateSignInWithRedirect } from '@/firebase/non-blocking-login';
import { GithubAuthProvider, GoogleAuthProvider, User } from 'firebase/auth';
import { useEffect } from 'react';
import { doc, setDoc, writeBatch } from 'firebase/firestore';


const formSchema = z.object({
  userType: z.enum(['student', 'university', 'company']),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' }),
  displayName: z.string().min(1, { message: 'Display name is required.' }),
});

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35.0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35.0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }
  
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 18h.01" />
            <path d="M16 12a4 4 0 1 0-8 0" />
            <path d="M12 22a10 10 0 0 0 10-10h-5" />
            <path d="M12 2a10 10 0 0 0-10 10h5" />
            <path d="M12 12a6 6 0 0 0-6 6" />
        </svg>
    )
}

export function SignUpForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: 'student',
      email: '',
      password: '',
      displayName: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user && firestore) {
      const createUserProfile = async (firebaseUser: User) => {
        const userProfile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || form.getValues('displayName'),
            photoURL: firebaseUser.photoURL,
            userType: form.getValues('userType'),
        };

        const batch = writeBatch(firestore);

        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        batch.set(userDocRef, userProfile, { merge: true });

        // Grant admin role upon signup
        const adminRoleRef = doc(firestore, 'roles_admin', firebaseUser.uid);
        batch.set(adminRoleRef, { uid: firebaseUser.uid, role: 'admin' });
        
        await batch.commit();
        
        router.push('/dashboard');
      }
      createUserProfile(user);
    }
  }, [user, isUserLoading, router, firestore, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await initiateEmailSignUp(auth, values.email, values.password);
  }

  const handleGoogleSignIn = () => {
    const googleProvider = new GoogleAuthProvider();
    initiateSignInWithRedirect(auth, googleProvider);
  };

  const handleGitHubSignIn = () => {
    const githubProvider = new GithubAuthProvider();
    initiateSignInWithRedirect(auth, githubProvider);
  };

  if (isUserLoading || user) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={handleGoogleSignIn}><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
        <Button variant="outline" onClick={handleGitHubSignIn}><GitHubIcon className="mr-2 h-4 w-4" /> GitHub</Button>
      </div>
      <Separator className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a...</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="university">University / College</SelectItem>
                    <SelectItem value="company">Industry / Company</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full font-bold">
            Create Account
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </div>
    </>
  );
}
