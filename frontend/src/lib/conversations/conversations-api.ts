import { apiClient } from "@/lib/api-client";

export type ConversationParticipant = { user: { id: string; fullName: string } };
export type ConversationPreview = {
  id: string;
  participants: ConversationParticipant[];
  messages: { content: string; sentAt: string }[];
};

export type DirectMessage = {
  id: string;
  content: string;
  sentAt: string;
  sender: { id: string; fullName: string };
};

export async function fetchConversations(): Promise<ConversationPreview[]> {
  const res = await apiClient.get("/conversations");
  return res.data;
}

export async function createConversation(participantIds: string[]) {
  const res = await apiClient.post("/conversations", { participantIds });
  return res.data as ConversationPreview;
}

export async function fetchConversationMessages(id: string): Promise<DirectMessage[]> {
  const res = await apiClient.get(`/conversations/${id}/messages`);
  return res.data.reverse();
}

export type SearchedUser = { id: string; fullName: string; email: string; role: string };

export async function searchUsers(query: string): Promise<SearchedUser[]> {
  const res = await apiClient.get("/users/search", { params: { q: query || undefined } });
  return res.data;
}