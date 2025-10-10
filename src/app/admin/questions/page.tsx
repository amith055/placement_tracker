import { Button } from '@/components/ui/button';
import { adminQuestions } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminQuestionsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">Manage aptitude and coding questions.</p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add New Question</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>
                    Fill in the details for the new question. Click save when you're done.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                        Category
                        </Label>
                        <Select>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="aptitude">Aptitude</SelectItem>
                                <SelectItem value="coding">Coding</SelectItem>
                                <SelectItem value="soft-skills">Soft Skills</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="question-text" className="text-right">
                        Question
                        </Label>
                        <Textarea id="question-text" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                <Button type="submit">Save Question</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question Text</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminQuestions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium max-w-sm truncate">{q.text}</TableCell>
                <TableCell>
                  <Badge variant={q.category === 'Aptitude' ? 'default' : 'secondary'}>{q.category}</Badge>
                </TableCell>
                <TableCell>{q.type}</TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
