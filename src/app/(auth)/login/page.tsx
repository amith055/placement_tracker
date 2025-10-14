'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        setError('Please verify your email first!');
        return;
      }

      // Successful login
      // example after successful login
localStorage.setItem("userEmail", email);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setInfo('');

    try {
      // Sign in temporarily to get user object
      const tempUser = await signInWithEmailAndPassword(auth, email, password);
      if (tempUser.user.emailVerified) {
        setInfo('Your email is already verified. Please login.');
        return;
      }

      // Resend verification email
      await sendEmailVerification(tempUser.user, {
        url: 'http://localhost:9002/login', // Update to your domain
      });

      setInfo('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Login</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {info && <p className="text-green-500 text-sm">{info}</p>}

        <Button className="w-full" onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        {error === 'Please verify your email first!' && (
          <Button variant="outline" className="w-full mt-2" onClick={handleResendVerification}>
            Resend Verification Email
          </Button>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}