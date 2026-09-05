"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useJoinMeeting, useEndMeeting } from "@/lib/meetings/use-meetings";
import { toast } from "sonner";

type ActiveCall = {
  meetingId: string;
  token: string;
  url: string;
  classroomName: string;
  isHost: boolean;
};

type MeetingContextValue = {
  activeCall: ActiveCall | null;
  isMinimized: boolean;
  startCall: (classroomId: string, classroomName: string, isHost: boolean) => void;
  leaveCall: () => void;
  endCallForEveryone: () => void;
  toggleMinimize: () => void;
};

const MeetingContext = createContext<MeetingContextValue | null>(null);

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const joinMeeting = useJoinMeeting();
  const endMeeting = useEndMeeting();

  const startCall = useCallback(
    (classroomId: string, classroomName: string, isHost: boolean) => {
      joinMeeting.mutate(classroomId, {
        onSuccess: (data) => {
          setActiveCall({ ...data, classroomName, isHost });
          setIsMinimized(false);
        },
      });
    },
    [joinMeeting],
  );

  const leaveCall = useCallback(() => {
    setActiveCall(null);
    setIsMinimized(false);
  }, []);

  const endCallForEveryone = useCallback(() => {
    if (!activeCall) return;
    endMeeting.mutate(activeCall.meetingId, {
      onSuccess: () => {
        toast.success("Meeting ended");
        leaveCall();
      },
    });
  }, [activeCall, endMeeting, leaveCall]);

  const toggleMinimize = useCallback(() => setIsMinimized((m) => !m), []);

  return (
    <MeetingContext.Provider
      value={{ activeCall, isMinimized, startCall, leaveCall, endCallForEveryone, toggleMinimize }}
    >
      {children}
    </MeetingContext.Provider>
  );
}

export function useActiveCall() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error("useActiveCall must be used within MeetingProvider");
  return ctx;
}