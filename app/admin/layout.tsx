'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/ModeToggle';
import { AuthProvider } from '@/app/auth/AuthProvider';
import { AdminNavLinks } from '@/components/admin/AdminNavLinks';
import { UserMenu } from '@/components/admin/UserMenu';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// Desktop Sidebar component
function DesktopSidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span className="">Food Truck Admin</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <AdminNavLinks />
          </nav>
        </div>
      </div>
    </div>
  );
}

// Mobile Navigation component
function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Home className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold">
            <Home className="h-6 w-6" />
            <span className="sr-only">Food Truck Admin</span>
          </Link>
          <AdminNavLinks isMobile={true} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function AdminLayoutContent({ children }: { readonly children: React.ReactNode }) {
  const { user, userInitials, handleSignOut } = useAdminAuth();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DesktopSidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <MobileNavigation />
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                />
              </div>
            </form>
          </div>
          <ModeToggle />
          <UserMenu user={user ?? null} userInitials={userInitials} handleSignOut={handleSignOut} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
