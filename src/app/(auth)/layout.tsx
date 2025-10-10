import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-3xl font-bold">NexusPrep</h1>
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
