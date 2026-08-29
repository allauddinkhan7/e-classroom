"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  Bell,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/lib/auth/use-current-user";

const studentNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/classrooms", label: "My Classrooms", icon: BookOpen },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const teacherNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/classrooms", label: "My Classrooms", icon: BookOpen },
  { href: "/students", label: "Students", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const items = user?.role === "TEACHER" ? teacherNav : studentNav;

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2 px-3 py-4">
        <GraduationCap className="h-6 w-6" />
        <span className="text-lg font-semibold">E-Classroom</span>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}