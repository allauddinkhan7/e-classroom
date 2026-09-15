"use client";

import Link from "next/link";
import { AlertCircle, Loader2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useConversations } from "@/lib/conversations/use-conversations";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { NewMessageDialog } from "@/components/messages/new-message-dialog";

export default function MessagesPage() {
  const { user } = useCurrentUser();
  const { data: conversations, isLoading, isError } = useConversations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">Your direct conversations</p>
        </div>
        <NewMessageDialog />
      </div>

      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">Couldn&apos;t load your messages.</p>
        </div>
      )}

      {!isLoading && !isError && conversations?.length === 0 && (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="text-sm text-muted-foreground">Start one with the button above.</p>
        </div>
      )}

      {!isLoading && !isError && conversations && conversations.length > 0 && (
        <div className="divide-y rounded-lg border bg-background">
          {conversations.map((conv) => {
            const other = conv.participants.find((p) => p.user.id !== user?.userId)?.user;
            const lastMessage = conv.messages[0];
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-3 hover:bg-secondary/30"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{other?.fullName.slice(0, 2).toUpperCase() ?? "??"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{other?.fullName ?? "Unknown"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lastMessage ? lastMessage.content : "No messages yet"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}