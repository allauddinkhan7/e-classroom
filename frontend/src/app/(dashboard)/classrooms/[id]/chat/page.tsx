"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useMessageHistory } from "@/lib/chat/use-message-history";
import { useChatSocket } from "@/lib/chat/use-chat-socket";
import { useIsOnline } from "@/lib/presence/presence-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Member = {
  id: string;
  fullName: string;
};

function ConversationRow({
  member,
  isYou,
}: {
  member: Member;
  isYou: boolean;
}) {
  const isOnline = useIsOnline(member.id);
  return (
    <button className="flex w-full items-center gap-3 p-3 text-left hover:bg-secondary/30">
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {member.fullName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {member.fullName}
          {isYou && (
            <span className="ml-2 text-sm text-muted-foreground">you</span>
          )}
        </p>
      </div>
    </button>
  );
}

export default function ClassroomChatPage() {
  const params = useParams<{ id: string }>();
  const { user } = useCurrentUser();

  const { data: history, isLoading } = useMessageHistory(params.id);
  const { isConnected, liveMessages, sendMessage } = useChatSocket({ type: "classroom", id: params.id });
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = [...(history ?? []), ...liveMessages];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft.trim());
    setDraft("");
  }

  const members = Array.from(
    new Map(
      (history ?? []).map((message) => [message.sender.id, message.sender]),
    ).values(),
  );

  // const isYou = members.some((message) => message.id == user?.userId) ? members["you"] : true : false ;
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border">
      {/* Header — fixed height */}
      <div className="flex shrink-0 items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <Link href={`/classrooms/${params.id}/`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h2 className="text-sm font-bold">Classroom Chat</h2>
        </div>
        <span
          className={`text-xs ${isConnected ? "text-emerald-600" : "text-muted-foreground"}`}
        >
          {isConnected ? "Connected" : "Connecting..."}
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="w-68 shrink-0 overflow-y-auto border-r p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Classroom Members
          </p>
          <div className="divide-y">
            {members.map((member) => {
              const isYou = member.id === user?.userId;
              return (
                <ConversationRow
                  key={member.id}
                  member={member}
                  isYou={isYou}
                />
              );
            })}
          </div>
          <div className="divide-y"></div>
        </div>

        {/* Chat column — messages scroll, form stays pinned at the bottom */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender.id === user?.userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                  >
                    <span className="text-xs text-muted-foreground">
                      {msg.sender.fullName}
                    </span>
                    <div
                      className={`max-w-[75%] px-3 py-2 text-sm ${
                        isOwn
                          ? "rounded-tl-xl rounded-br-xl rounded-bl-xl bg-primary text-primary-foreground"
                          : "rounded-tr-xl rounded-br-xl rounded-bl-xl border bg-secondary"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex shrink-0 items-center gap-2 border-t p-3"
          >
            <Input
              placeholder="Type a message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!isConnected}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!isConnected || !draft.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
