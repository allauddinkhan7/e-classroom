"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type ChatMessage = {
  id: string;
  content: string;
  sentAt: string;
  sender: { id: string; fullName: string };
};

export function useChatSocket(classroomId: string) {
  const socketRef = useRef<Socket | null>(null); // used useRef for 
  const [isConnected, setIsConnected] = useState(false);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("joinClassroom", { classroomId });
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("newMessage", (message: ChatMessage) => {
      setLiveMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [classroomId]);

  function sendMessage(content: string) {
    socketRef.current?.emit("sendMessage", { classroomId, content });
  }

  return { isConnected, liveMessages, sendMessage };
}

/*

One real design choice worth understanding: this hook keeps live-received messages in their own array (liveMessages),
separate from the history we'll fetch via TanStack Query — we merge the two for display rather than trying to shove live socket data into React Query's cache directly. 
That separation keeps "data I fetched" and "data that streamed in" as clearly distinct concerns, which is simpler to reason
about than fighting React Query's cache-update APIs for something it wasn't really designed for.

*/