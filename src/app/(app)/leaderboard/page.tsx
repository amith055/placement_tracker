'use client';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { leaderboardData } from '@/lib/mock-data';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LeaderboardPage() {
    const [showAll, setShowAll] = useState(false);

    const displayedData = showAll ? leaderboardData : leaderboardData.filter(u => u.optedIn);
    const userAvatar = PlaceHolderImages.find((img) => img.id === 'avatar-1');
    const otherAvatar = PlaceHolderImages.find((img) => img.id === 'avatar-2');


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
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedData.map((user, index) => (
              <TableRow key={index} className={user.name === 'Alex Doe' ? 'bg-primary/10' : ''}>
                <TableCell className="font-medium text-lg text-center">{user.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={user.name === 'Alex Doe' ? userAvatar?.imageUrl : otherAvatar?.imageUrl} alt={user.name} data-ai-hint={user.name === 'Alex Doe' ? userAvatar?.imageHint : otherAvatar?.imageHint} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name} {user.optedIn ? '' : '(Opted Out)'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold text-lg">{user.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
