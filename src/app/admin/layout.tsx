
"use client";

import Link from "next/link";
import {
  BookOpenCheck,
  Home,
  LogOut,
  Users,
  Settings,
  FileText,
  Book,
  UserPlus,
  FileEdit,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface AdminUser {
  username: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    // Redirect to the login page to "log out"
    window.location.href = "/login";
  };

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : 'A';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar className="border-r bg-background" variant="inset">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                  >
                    <BookOpenCheck className="h-4 w-4" />
                    <span className="font-semibold">FeeFlow</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin"
                        className={cn(
                          pathname === "/admin" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Home className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin/students"
                        className={cn(
                          pathname === "/admin/students" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Users className="h-5 w-5" />
                        <span>Students</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin/admissions"
                        className={cn(
                          pathname === "/admin/admissions" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <UserPlus className="h-5 w-5" />
                        <span>Admissions</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin/books"
                        className={cn(
                          pathname === "/admin/books" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Book className="h-5 w-5" />
                        <span>Books Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin/data-entry"
                        className={cn(
                          pathname === "/admin/data-entry" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <FileEdit className="h-5 w-5" />
                        <span>Data Entry</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin/print-notices"
                        className={cn(
                          pathname === "/admin/print-notices" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <FileText className="h-5 w-5" />
                        <span>Print Notices</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin/settings"
                        className={cn(
                          pathname === "/admin/settings" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
           <h1 className="text-xl font-semibold">
             {pathname === '/admin' && 'Dashboard'}
             {pathname === '/admin/students' && 'Students'}
             {pathname === '/admin/admissions' && 'Admissions'}
             {pathname === '/admin/books' && 'Books Dashboard'}
             {pathname === '/admin/settings' && 'Settings'}
             {pathname === '/admin/data-entry' && 'Data Entry'}
             {pathname === '/admin/print-notices' && 'Print Notices'}
           </h1>
          <div className="relative ml-auto flex-1 md:grow-0">
             {/* Can add a search bar here later */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar>
                    <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               {user && (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
    </SidebarProvider>
  );
}
