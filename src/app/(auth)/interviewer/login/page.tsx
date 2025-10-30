'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase'; // Firestore instance
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Query the "int_users" collection using userId
      const q = query(collection(db, 'int_users'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User not found');
        return;
      }

      // Assuming user_id is unique → take the first document
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Compare passwords (plain comparison for now)
      if (userData.password === password) {
        // Successful login
        localStorage.setItem('userId', userId);
        router.push('/interviewer/dashboard');
      } else {
        setError('Incorrect password');
      }
    } catch (err: any) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Interviewer Login</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your User ID"
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

        <Button className="w-full" onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </CardContent>
    </Card>
  );
}
