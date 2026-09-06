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

export function TopBar() {
  const { user } = useCurrentUser();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";
  

  return (
    <header className="flex h-14 items-center justify-end border-b bg-white px-4 lg:px-6">
      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden" />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-0">
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
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
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

            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}