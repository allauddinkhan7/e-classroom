"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { apiClient } from "@/lib/api-client";

type PresenceContextValue = {
  onlineUserIds: Set<string>;
  checkInitialPresence: (userIds: string[]) => void;
};

const PresenceContext = createContext<PresenceContextValue>({
  onlineUserIds: new Set(),
  checkInitialPresence: () => {},
});

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const checkedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL, { auth: { token } });

    socket.on("presenceChanged", ({ userId, online }: { userId: string; online: boolean }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        online ? next.add(userId) : next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const checkInitialPresence = useCallback((userIds: string[]) => {
    // Only ask about IDs we haven't already checked, so re-renders
    // don't keep re-fetching the same users' status over and over.
    const unchecked = userIds.filter((id) => id && !checkedIdsRef.current.has(id));
    if (unchecked.length === 0) return;
    unchecked.forEach((id) => checkedIdsRef.current.add(id));

    apiClient
      .get("/presence", { params: { userIds: unchecked.join(",") } })
      .then((res) => {
        const online: { userId: string; online: boolean }[] = res.data;
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          online.forEach((entry) => {
            entry.online ? next.add(entry.userId) : next.delete(entry.userId);
          });
          return next;
        });
      })
      .catch(() => {
        // presence is a nice-to-have, not critical — fail silently
      });
  }, []);

  return (
    <PresenceContext.Provider value={{ onlineUserIds, checkInitialPresence }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function useIsOnline(userId?: string) {
  const { onlineUserIds } = useContext(PresenceContext);
  return userId ? onlineUserIds.has(userId) : false;
}

export function useCheckInitialPresence() {
  return useContext(PresenceContext).checkInitialPresence;
}


/*
This one socket connection exists purely to listen for presence broadcasts app-wide — separate from the per-chat sockets from useChatSocket,
which each also independently announce markOnline when opened.
A bit of connection overlap, but it keeps presence genuinely global without threading chat-specific state through the whole app.

*/