"use client";

import { AlertCircle, Loader2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useConversations } from "@/lib/conversations/use-conversations";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useIsOnline } from "@/lib/presence/presence-context";
import { cn } from "@/lib/utils";

type ConversationRowData = {
  id: string;
  other?: { id: string; fullName: string };
  lastMessage?: { content: string };
};

function ConversationRow({
  conversation,
  isActive,
  onSelect,
}: {
  conversation: ConversationRowData;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  const isOnline = useIsOnline(conversation.other?.id);
  console.log(".....................................",isOnline)
  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "flex w-full items-center gap-3 p-3 text-left hover:bg-secondary/30",
        isActive && "bg-secondary/50",
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {conversation.other?.fullName.slice(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{conversation.other?.fullName ?? "Unknown"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {conversation.lastMessage ? conversation.lastMessage.content : "No messages yet"}
        </p>
      </div>
    </button>
  );
}

export function ConversationList({
  activeId,
  onSelect,
}: {
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  const { user } = useCurrentUser();
  const { data: conversations, isLoading, isError } = useConversations();

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 p-4 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Couldn&apos;t load your messages.</p>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 p-4 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="text-sm text-muted-foreground">Start one with the button above.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conv) => {
        const other = conv.participants.find((p) => p.user.id !== user?.userId)?.user;
        return (
          <ConversationRow
            key={conv.id}
            conversation={{ id: conv.id, other, lastMessage: conv.messages[0] }}
            isActive={activeId === conv.id}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}