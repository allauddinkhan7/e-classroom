"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { NewMessageDialog } from "@/components/messages/new-message-dialog";
import { ConversationList } from "@/components/messages/conversation-list";
import { ConversationThread } from "@/components/messages/conversation-thread";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* List pane — full width on mobile when nothing's selected, fixed width alongside the thread on desktop */}
      <div
        className={cn(
          "flex w-full flex-col rounded-l-lg border-t border-l border-b bg-background lg:w-80 lg:shrink-0",
          selectedId && "hidden lg:flex", // hide list on mobile once a thread is open
        )}
      >
        <div className="flex items-center justify-between border-b p-3">
          <h1 className="text-sm font-semibold">Messages</h1>
            <NewMessageDialog onCreated={setSelectedId} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList activeId={selectedId ?? undefined} onSelect={setSelectedId} />
        </div>
      </div>

      {/* Thread pane — hidden on mobile until a conversation is selected; always visible on desktop */}
      <div
        className={cn(
          "w-full flex-1 rounded-r-lg bg-background border",
          !selectedId && "hidden lg:flex lg:items-center lg:justify-center",
        )}
      >
        {selectedId ? (
          <ConversationThread conversationId={selectedId} onBack={() => setSelectedId(null)} />
        ) : (
          <div className="hidden flex-col items-center gap-2 text-center text-muted-foreground lg:flex">
            <MessageSquare className="h-10 w-10" />
            <p className="text-sm">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}