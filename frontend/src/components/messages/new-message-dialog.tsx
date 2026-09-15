"use client";

import { useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSearchUsers, useStartConversation } from "@/lib/conversations/use-conversations";

export function NewMessageDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useSearchUsers(search);
  const startConversation = useStartConversation();

  function handleSelect(userId: string) {
    startConversation.mutate([userId], { onSuccess: () => setOpen(false) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-2 h-4 w-4" />
        New Message
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>Search for anyone to start a conversation.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="h-64 rounded-md border">
          {isLoading || startConversation.isPending ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : users && users.length > 0 ? (
            <div className="p-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelect(u.id)}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm hover:bg-secondary/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {u.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No users found
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}