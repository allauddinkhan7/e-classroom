"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type ChatMessage = {
  id: string;
  content: string;
  sentAt: string;
  sender: { id: string; fullName: string };
};

type ChatTarget = { type: "classroom" | "conversation"; id: string };

export function useChatSocket(target: ChatTarget) {
  const socketRef = useRef<Socket | null>(null); 
  const [isConnected, setIsConnected] = useState(false);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const socket = io(process.env.NEXT_PUBLIC_API_URL, { auth: { token } });
    socketRef.current = socket;
    const joinEvent = target.type === "classroom" ? "joinClassroom" : "joinConversation";
    const idKey = target.type === "classroom" ? "classroomId" : "conversationId";
    const messageEvent = target.type === "classroom" ? "newMessage" : "newDirectMessage";

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit(joinEvent, { [idKey]: target.id }); //target.id -> classroomId or conversationId
      socket.emit("markOnline");
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on(messageEvent, (message: ChatMessage) => {
      setLiveMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [target.type, target.id]);

  function sendMessage(content: string) {
    const event = target.type === "classroom" ? "sendMessage" : "sendDirectMessage";
    const idKey = target.type === "classroom" ? "classroomId" : "conversationId";
    socketRef.current?.emit(event, { [idKey]: target.id, content });
  }
  console.log("socketRef ........................", socketRef);


  return { isConnected, liveMessages, sendMessage };
}

/*

One real design choice worth understanding: this hook keeps live-received messages in their own array (liveMessages),
separate from the history we'll fetch via TanStack Query — we merge the two for display rather than trying to shove live socket data into React Query's cache directly. 
That separation keeps "data I fetched" and "data that streamed in" as clearly distinct concerns, which is simpler to reason
about than fighting React Query's cache-update APIs for something it wasn't really designed for.

*/