"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Briefcase,
  FileText,
  Settings,
  CheckCircle,
  HandHeart,
  HeartHandshake,
  Cake,
  UserCog,
  Banknote,
  Package,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Members",
    icon: Users,
    href: "/dashboard/members",
    color: "text-violet-500",
  },
  {
    label: "Departments",
    icon: Briefcase,
    href: "/dashboard/departments",
    color: "text-pink-700",
  },
  {
    label: "Events",
    icon: Calendar,
    href: "/dashboard/events",
    color: "text-orange-700",
  },
  {
    label: "Finance",
    icon: CreditCard,
    href: "/dashboard/finance",
    color: "text-emerald-500",
  },
  {
    label: "Attendance",
    icon: CheckCircle,
    href: "/dashboard/attendance",
    color: "text-teal-500",
  },
  {
    label: "Tithes",
    icon: HandHeart,
    href: "/dashboard/tithes",
    color: "text-rose-500",
  },
  {
    label: "Welfare",
    icon: HeartHandshake,
    href: "/dashboard/welfare",
    color: "text-fuchsia-500",
  },
  {
    label: "Soul Winning",
    icon: HeartHandshake,
    href: "/dashboard/soul-winning",
    color: "text-red-500",
  },
  {
    label: "Weddings & Birthdays",
    icon: Cake,
    href: "/dashboard/weddings-birthdays",
    color: "text-purple-500",
  },
  {
    label: "Staff",
    icon: UserCog,
    href: "/dashboard/staff",
    color: "text-indigo-500",
  },
  {
    label: "Payroll",
    icon: Banknote,
    href: "/dashboard/payroll",
    color: "text-yellow-500",
  },
  {
    label: "Assets",
    icon: Package,
    href: "/dashboard/assets",
    color: "text-blue-500",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/dashboard/reports",
    color: "text-green-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full overflow-y-auto bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">ChurchFlow</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
