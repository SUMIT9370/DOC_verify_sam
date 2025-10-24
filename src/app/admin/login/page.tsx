'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GovIndiaLogo } from '@/components/icons/gov-india-logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // IMPORTANT: This is a temporary, insecure login for demonstration.
    // In a real application, you would use a secure authentication service.
    if (email === 'admin@duckverify.gov.in' && password === 'password') {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      toast({
        title: 'Login Successful',
        description: 'Redirecting to the admin dashboard.',
      });
      router.push('/admin');
    } else {
      setError('Invalid Email or Password.');
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div
          className="flex items-center justify-center gap-2 mb-6"
        >
          <GovIndiaLogo className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold font-headline">DuckVerify Admin</span>
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
                  placeholder="admin@duckverify.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
              <Button type="submit" className="w-full font-bold">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
