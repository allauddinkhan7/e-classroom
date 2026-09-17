"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useMessageHistory } from "@/lib/chat/use-message-history";
import { useChatSocket } from "@/lib/chat/use-chat-socket";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ConversationList } from "@/components/messages/conversation-list";

export default function ClassroomChatPage() {
  const params = useParams<{ id: string }>();
  console.log(
    "first.......................................................................",
    params,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { user } = useCurrentUser();
  const { data: history, isLoading } = useMessageHistory(params.id);
  const { isConnected, liveMessages, sendMessage } = useChatSocket({
    type: "classroom",
    id: params.id,
  });
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

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border">
      <div
        className={cn(
          "flex w-full flex-col rounded-l-lg border-t border-l border-b bg-background lg:w-80 lg:shrink-0",
          selectedId && "hidden lg:flex", // hide list on mobile once a thread is open
        )}
      >
        <div className="flex items-center gap-2 p-3">
          <Link href={`/classrooms/${params.id}/`} className="group block">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h2 className="text-sm font-bold">Classroom Chat</h2>
        </div>
       <div className="flex-1 overflow-y-auto">
        <ConversationList activeId={selectedId ?? undefined} onSelect={setSelectedId} />
        </div>
      </div>

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
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
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
        className="flex items-center gap-2 border-t p-3"
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
  );
}
