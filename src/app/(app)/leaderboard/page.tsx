'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase'; // Firestore init file
import { collection, getDocs } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LeaderboardPage() {
  const [showAll, setShowAll] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userAvatar = PlaceHolderImages.find((img) => img.id === 'avatar-1');
  const otherAvatar = PlaceHolderImages.find((img) => img.id === 'avatar-2');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userList: any[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const appti_score = parseFloat(data.appti_score || 0);
          const coding_score = parseFloat(data.coding_score || 0);
          const softskill_score = parseFloat(data.softskill_score || 0);

          // readiness_score formula
          const readiness_score = (
            0.3 * appti_score +
            0.4 * coding_score +
            0.3 * softskill_score
          ).toFixed(2);

          userList.push({
            id: doc.id,
            name: data.name || 'Unknown',
            email: data.email || '',
            appti_score,
            coding_score,
            softskill_score,
            readiness_score: parseFloat(readiness_score),
            optedIn: data.optedIn ?? true,
          });
        });

        // sort by readiness score descending
        userList.sort((a, b) => b.readiness_score - a.readiness_score);

        // assign ranks
        userList.forEach((user, index) => (user.rank = index + 1));

        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const displayedData = showAll ? users : users.filter((u) => u.optedIn);

  if (loading) return <p className="text-center mt-6">Loading leaderboard...</p>;

  return (
    <div>
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank among your peers.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="show-all" checked={showAll} onCheckedChange={setShowAll} />
          <Label htmlFor="show-all">Show all students (including opted-out)</Label>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-center">Aptitude</TableHead>
              <TableHead className="text-center">Coding</TableHead>
              <TableHead className="text-center">Soft Skills</TableHead>
              <TableHead className="text-right">Readiness %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedData.map((user) => (
              <TableRow key={user.id} className={user.rank === 1 ? 'bg-primary/10' : ''}>
                <TableCell className="font-medium text-lg text-center">{user.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={user.rank === 1 ? userAvatar?.imageUrl : otherAvatar?.imageUrl}
                        alt={user.name}
                        data-ai-hint={
                          user.rank === 1
                            ? userAvatar?.imageHint
                            : otherAvatar?.imageHint
                        }
                      />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name} {user.optedIn ? '' : '(Opted Out)'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{user.appti_score}%</TableCell>
                <TableCell className="text-center">{user.coding_score}%</TableCell>
                <TableCell className="text-center">{user.softskill_score}%</TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {user.readiness_score}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
