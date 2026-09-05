"use client";

import {
  Menu,
  CalendarDays,
  Clock,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SidebarNav } from "./sidebar-nav";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { logout } from "@/lib/auth/logout";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useClassrooms } from "@/lib/classrooms/use-classrooms";

export function TopBar() {
  const { user } = useCurrentUser();
  const pathname = usePathname();

  const [now, setNow] = useState(() => new Date());

  const initials =
    user?.email?.slice(0, 2).toUpperCase() ?? "??";

  /*
   * Detect:
   *
   * /classrooms/[id]
   * /classrooms/[id]/members
   * /classrooms/[id]/assignments
   * /classrooms/[id]/materials
   * /classrooms/[id]/notes
   */
  const classroomMatch = pathname.match(
    /^\/classrooms\/([^/]+)(?:\/([^/]+))?$/
  );

  const classroomId = classroomMatch?.[1];
  const sectionSlug = classroomMatch?.[2];

  // useClassrooms returns the complete array
  const { data: classrooms } = useClassrooms();

  // Find the specific classroom from that array
  const classroom = classrooms?.find(
    (item) => item.id === classroomId
  );

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const sectionLabels: Record<string, string> = {
    members: "Members",
    assignments: "Assignments",
    materials: "Materials",
    notes: "Notes",
  };

  const breadcrumbs = useMemo(() => {
    if (!classroomId) {
      return null;
    }

    return {
      classroomName: classroom?.name ?? "Classroom",
      sectionName: sectionSlug
        ? sectionLabels[sectionSlug]
        : null,
    };
  }, [classroomId, classroom?.name, sectionSlug]);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 lg:px-6">

      {/* Left side */}
      <div className="flex min-w-0 items-center">
        {breadcrumbs ? (
          <div className="flex min-w-0 items-center gap-1 text-sm">

            <span className="font-medium text-slate-500">
              Classrooms
            </span>

            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />

            <span className="truncate font-semibold text-slate-900">
              {breadcrumbs.classroomName}
            </span>

            {breadcrumbs.sectionName && (
              <>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />

                <span className="truncate font-medium text-slate-600">
                  {breadcrumbs.sectionName}
                </span>
              </>
            )}

          </div>
        ) : (
          <h1 className="text-base font-bold text-slate-900">
            E-Classroom
          </h1>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

        {/* Date / Time */}
        <div className="hidden items-center gap-4 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 sm:flex">

          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span className="tabular-nums">
              {dateLabel}
            </span>
          </span>

          <span className="h-4 w-px bg-slate-300" />

          <span className="flex items-center gap-2 font-semibold text-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="tabular-nums">
              {timeLabel}
            </span>
          </span>

        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-64 p-0"
          >
            <SidebarNav className="p-2" />
          </SheetContent>
        </Sheet>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2"
              />
            }
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled
              className="text-xs text-muted-foreground"
            >
              {user?.role}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}