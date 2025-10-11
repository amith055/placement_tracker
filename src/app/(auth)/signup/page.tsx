'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Import the correct Firestore instance (usually 'db')

// If your Firestore instance is exported as 'firestore' in '@/lib/firebase', update all usages of 'db' to 'firestore' below:
import { doc, setDoc } from 'firebase/firestore';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usn, setUsn] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  var appti_score=0;
  var coding_score=0;
  var softskill_score=0;

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!name || !email || !password || !usn || !year) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 2️⃣ Update display name
      await updateProfile(userCredential.user, { displayName: name });

      // 3️⃣ Send email verification
      await sendEmailVerification(userCredential.user, {
        url: 'http://localhost:9002/login', // replace with your production URL
      });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        usn,
        year,
        createdAt: new Date(),
        appti_score,
        coding_score,
        softskill_score
      });

      setSuccess(
        'Account created! A verification email has been sent. Please verify before logging in.'
      );

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setUsn('');
      setYear('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
        <CardDescription>Join NexusPrep and start your journey to success.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Doe"
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="usn">USN</Label>
          <Input
            id="usn"
            type="text"
            value={usn}
            onChange={(e) => setUsn(e.target.value)}
            placeholder="1BMXX001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="3rd Year"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <Button className="w-full" onClick={handleSignup} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}