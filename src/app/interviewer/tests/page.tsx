'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('No userId found in localStorage');
          setLoading(false);
          return;
        }

        // Query tests for this specific interviewer
        const q = query(collection(db, 'int_tests'), where('user_id', '==', userId));
        const querySnapshot = await getDocs(q);

        const fetchedTests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTests(fetchedTests);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Tests</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => router.push('/admin/add-test')}
        >
          <Plus className="w-4 h-4" />
          Add Test
        </Button>
      </div>

      {/* Content Section */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tests.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No tests available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => (
            <Card key={test.id} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{test.title || 'Untitled Test'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {test.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
