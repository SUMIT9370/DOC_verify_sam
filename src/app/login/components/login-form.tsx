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
import { Separator } from '@/components/ui/separator';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateSignInWithRedirect } from '@/firebase/non-blocking-login';
import { GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (auth) {
        initiateEmailSignIn(auth, values.email, values.password);
    }
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
            Sign In
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </>
  );
}
