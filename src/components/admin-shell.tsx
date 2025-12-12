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
  GraduationCap,
  Menu,
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

import { AdminUser } from "@/lib/definitions";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    window.location.href = "/login";
  };

  const userInitial = user?.username?.slice(0, 1).toUpperCase() || "A";

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/teachers", label: "Staff", icon: GraduationCap },
    { href: "/admin/admissions", label: "Admissions", icon: UserPlus },
    { href: "/admin/books", label: "Books", icon: Book },
    { href: "/admin/data-entry", label: "Data Entry", icon: FileEdit },
    { href: "/admin/print-notices", label: "Print Notices", icon: FileText },
    { href: "/admin/sms", label: "Send SMS", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        {/* SIDEBAR (auto becomes drawer on mobile) */}
        <Sidebar className="border-r bg-background" variant="inset" collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <BookOpenCheck className="h-4 w-4" />
                    <span className="font-semibold">FeeFlow</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            pathname === item.href &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">
          {/* HEADER — optimized for mobile */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-3 sm:px-6">

            {/* MOBILE HAMBURGER */}
            <SidebarTrigger className="sm:hidden">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>

            {/* DESKTOP SIDEBAR TOGGLE */}
            <SidebarTrigger className="hidden sm:flex" />

            {/* ROUTE TITLE */}
            <h1 className="text-lg sm:text-xl font-semibold capitalize truncate">
              {pathname === "/admin/teachers" 
                ? "Staff" 
                : pathname.replace("/admin", "").replace("/", "") || "Dashboard"}
            </h1>

            <div className="ml-auto"></div>

            {/* USER DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
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
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* PAGE BODY */}
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
