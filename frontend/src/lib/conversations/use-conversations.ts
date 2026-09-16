"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchConversations, createConversation, fetchConversationMessages, searchUsers } from "./conversations-api";

export function useConversations() {
  return useQuery({ 
    queryKey: ["conversations"],
    queryFn: fetchConversations
  });
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
  return useMutation({
    mutationFn: (participantIds: string[]) => createConversation(participantIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => searchUsers(query),
  });
}