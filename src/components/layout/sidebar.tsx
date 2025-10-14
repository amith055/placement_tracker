'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookCopy,
  Code,
  ClipboardList,
  Lightbulb,
  Trophy,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  CheckCircle,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: `/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/aptitude', icon: BookCopy, label: 'Aptitude' },
  { href: '/coding', icon: Code, label: 'Coding' },
  { href: '/soft-skills', icon: ClipboardList, label: 'Soft Skills' },
  { href: '/practice-tips', icon: Lightbulb, label: 'Practice Tips' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const adminNavItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/questions', icon: BookCopy, label: 'Questions' },
];

function NavContent({ items, isMobile = false }: { items: typeof navItems, isMobile?: boolean }) {
  const pathname = usePathname();

  const content = (
    <nav className="grid items-start gap-2">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const link = (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              { 'bg-muted text-primary': isActive }
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
        return isMobile ? link : (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );

  return isMobile ? content : <TooltipProvider>{content}</TooltipProvider>;
}

export function AppSidebar() {
 
  const avatar = PlaceHolderImages.find((img) => img.id === 'avatar-1');
  return (
    <>
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span className="font-headline">NexusPrep</span>
            </Link>
          </div>
          <div className="flex-1">
            <NavContent items={navItems} />
          </div>
          <div className="mt-auto p-4">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/login" className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileNav() {
    const avatar = PlaceHolderImages.find((img) => img.id === 'avatar-1');
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CheckCircle className="h-6 w-6 text-primary" />
            <span className="font-headline">NexusPrep</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
            <NavContent items={navItems} isMobile={true}/>
        </div>
        <div className="mt-auto border-t p-4">
            <Link href="/login" className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <LogOut className="h-4 w-4" />
                Logout
            </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AdminSidebar() {
    return (
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-headline">Admin Panel</span>
            </Link>
          </div>
          <div className="flex-1">
            <NavContent items={adminNavItems} />
          </div>
          <div className="mt-auto p-4">
            <Button size="sm" variant="ghost" className="w-full justify-start" asChild>
                <Link href="/dashboard"><LogOut className="mr-2 h-4 w-4" />Exit Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    );
}

export function AdminMobileNav() {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-headline">Admin</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
              <NavContent items={adminNavItems} isMobile={true}/>
          </div>
          <div className="mt-auto border-t p-4">
            <Button size="sm" variant="ghost" className="w-full justify-start" asChild>
                <Link href="/dashboard"><LogOut className="mr-2 h-4 w-4" />Exit Admin</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
}
