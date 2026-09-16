"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useConversationMessages, useConversations } from "@/lib/conversations/use-conversations";
import { useChatSocket } from "@/lib/chat/use-chat-socket";

export function ConversationThread({ conversationId, onBack }: { conversationId: string; onBack?: () => void }) {

  const { user } = useCurrentUser();
 
  const { data: history, isLoading } = useConversationMessages(conversationId);
  const { data: conversations } = useConversations();
  
  const { isConnected, liveMessages, sendMessage } = useChatSocket({ type: "conversation", id: conversationId });
  
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = [...(history ?? []), ...liveMessages];
  const conversation = conversations?.find((c) => c.id === conversationId);
  
  const other = conversation?.participants.find((p) => p.user.id !== user?.userId)?.user;

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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {other?.fullName.slice(0, 2).toUpperCase() ?? "??"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-sm font-medium">{other?.fullName ?? "Conversation"}</h2>
        </div>
        <span className={`text-xs ${isConnected ? "text-emerald-600" : "text-muted-foreground"}`}>
          {isConnected ? "Connected" : "Connecting..."}
        </span>
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
              <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                <span className="text-xs text-muted-foreground">{msg.sender.fullName}</span>
                <div
                  className={`max-w-[75%] px-3 py-2 text-sm ${
                    isOwn ? "bg-gray-800 text-primary-foreground border rounded-tl-xl rounded-br-xl rounded-bl-xl" : "bg-secondary border rounded-tr-xl rounded-br-xl rounded-bl-xl"
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

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-3">
        <Input
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!isConnected}
        />
        <Button type="submit" size="icon" disabled={!isConnected || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}