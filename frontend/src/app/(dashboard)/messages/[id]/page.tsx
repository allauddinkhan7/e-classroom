"use client";

import { useParams, useRouter } from "next/navigation";
import { ConversationThread } from "@/components/messages/conversation-thread";

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="h-[calc(100vh-8rem)] rounded-lg border border-red-600 bg-background">
      <ConversationThread conversationId={params.id} onBack={() => router.push("/messages")} />
    </div>
  );
}