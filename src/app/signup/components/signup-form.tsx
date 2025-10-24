'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import { doc, setDoc } from 'firebase/firestore';


const formSchema = z.object({
  userType: z.enum(['student', 'university', 'company']),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' }),
  displayName: z.string().min(1, { message: 'Display name is required.' }),
});

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
            // isAdmin is not set here by default for security
        };

        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        await setDoc(userDocRef, userProfile, { merge: true });
        
        router.push('/dashboard');
      }
      createUserProfile(user);
    }
  }, [user, isUserLoading, router, firestore, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await initiateEmailSignUp(auth, values.email, values.password);
  }

  const handleGoogleSignIn = () => {
    if (!auth) return;
    const googleProvider = new GoogleAuthProvider();
    initiateSignInWithRedirect(auth, googleProvider);
  };

  const handleGitHubSignIn = () => {
    if (!auth) return;
    const githubProvider = new GithubAuthProvider();
    initiateSignInWithRedirect(auth, githubProvider);
  };

  if (isUserLoading || user) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={handleGoogleSignIn}>
            <Image src="/google.svg" alt="Google Logo" width={16} height={16} className="mr-2 h-4 w-4" />
            Google
        </Button>
        <Button variant="outline" onClick={handleGitHubSignIn}>
            <Image src="/github.svg" alt="GitHub Logo" width={16} height={16} className="mr-2 h-4 w-4" />
            GitHub
        </Button>
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
                  <Input placeholder="Sumit" {...field} />
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
                  <Input placeholder="sumit@example.com" {...field} />
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
