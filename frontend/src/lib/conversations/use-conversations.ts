"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  fetchConversations,
  createConversation,
  fetchConversationMessages,
  searchUsers,
} from "./conversations-api";

export function useConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: fetchConversations });
}

export function useConversationMessages(id: string) {
  return useQuery({
    queryKey: ["conversations", id, "messages"],
    queryFn: () => fetchConversationMessages(id),
    enabled: !!id,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (participantIds: string[]) => createConversation(participantIds),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/messages/${conversation.id}`);
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => searchUsers(query),
  });
}