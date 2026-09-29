"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useJoinMeeting, useEndMeeting } from "@/lib/meetings/use-meetings";
import { toast } from "sonner";

type ActiveCall = {
  meetingId: string;
  token: string;
  url: string;
  classroomId: string;
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
  pendingAttendanceCheckId: string | null;
  lastAttendanceCheckId: string | null;
  respondToAttendance: () => void;
  triggerAttendanceCheck: () => void;
  pendingPopQuestion: PendingPopQuestion | null;
  lastPopQuestionId: string | null;
  respondToPopQuestion: (answer: string) => void;
  triggerPopQuestion: (question: string, answer: string) => void;
};

type PendingPopQuestion = { id: string; question: string };

const MeetingContext = createContext<MeetingContextValue | null>(null);

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pendingAttendanceCheckId, setPendingAttendanceCheckId] = useState<string | null>(null);
  const [lastAttendanceCheckId, setLastAttendanceCheckId] = useState<string | null>(null);
  const [pendingPopQuestion, setPendingPopQuestion] = useState<PendingPopQuestion | null>(null);
  const [lastPopQuestionId, setLastPopQuestionId] = useState<string | null>(null);
  const engagementSocketRef = useRef<Socket | null>(null);
  const joinMeeting = useJoinMeeting();
  const endMeeting = useEndMeeting();

  const startCall = useCallback(
    (classroomId: string, classroomName: string, isHost: boolean) => {
      joinMeeting.mutate(classroomId, {
        onSuccess: (data) => {
          setActiveCall({ ...data, classroomId, classroomName, isHost });
          setIsMinimized(false);
        },
      });
    },
    [joinMeeting],
  );

  const leaveCall = useCallback(() => {
    setActiveCall(null);
    setIsMinimized(false);
    setPendingAttendanceCheckId(null);
    setLastAttendanceCheckId(null);
    setPendingPopQuestion(null);
    setLastPopQuestionId(null);
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

  // Connect a socket purely for engagement events (attendance checks),
  // scoped to the lifetime of the active call. Connects when a call starts,
  // disconnects when it ends — never lives longer than the call itself.
  useEffect(() => {
    if (!activeCall) {
      engagementSocketRef.current?.disconnect();
      engagementSocketRef.current = null;
      return;
    }

    const token = localStorage.getItem("accessToken");
    const socket = io(process.env.NEXT_PUBLIC_API_URL, { auth: { token } });
    engagementSocketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinClassroom", { classroomId: activeCall.classroomId });
    });

    return () => {
      socket.disconnect();
      engagementSocketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCall?.meetingId]);

  // Event handlers live in their own effect so they always close over the
  // *current* activeCall value (isHost in particular), without needing to
  // tear down and reconnect the socket itself on every render.
  useEffect(() => {
    const socket = engagementSocketRef.current;
    if (!socket || !activeCall) return;

    function handleCheckStarted(data: { id: string }) {
      //if teacher
      if (activeCall!.isHost) {
        setLastAttendanceCheckId(data.id);
      } else { //if student
        setPendingAttendanceCheckId(data.id);
        toast.info("Your teacher started an attendance check!");
      }
    }

    function handleResponseReceived() {
      if (activeCall!.isHost) {
        toast.success("A student marked themselves present");
      }
    }

    socket.on("attendanceCheckStarted", handleCheckStarted);
    socket.on("attendanceResponseReceived", handleResponseReceived);


  // ====== POP-UP Random Attendance =======
    
    function handlePopQuestionStarted(data: { id: string; question: string }) {
      if (activeCall!.isHost) {
        setLastPopQuestionId(data.id);
      } else {
        setPendingPopQuestion({ id: data.id, question: data.question });
        toast.info("Your teacher asked a question!");
      }
    }

    function handlePopQuestionResponseReceived() {
      if (activeCall!.isHost) {
        toast.success("A student answered");
      }
    }

    socket.on("popQuestionStarted", handlePopQuestionStarted);
    socket.on("popQuestionResponseReceived", handlePopQuestionResponseReceived);

    return () => {
      socket.off("attendanceCheckStarted", handleCheckStarted);
      socket.off("attendanceResponseReceived", handleResponseReceived);
      socket.off("popQuestionStarted", handlePopQuestionStarted);
      socket.off("popQuestionResponseReceived", handlePopQuestionResponseReceived);
    };
  }, [activeCall]);

  const respondToAttendance = useCallback(() => {
    if (!activeCall || !pendingAttendanceCheckId) return;
    engagementSocketRef.current?.emit("respondToAttendance", {
      attendanceCheckId: pendingAttendanceCheckId,
      classroomId: activeCall.classroomId,
    });
    setPendingAttendanceCheckId(null);
    toast.success("Marked present");
  }, [activeCall, pendingAttendanceCheckId]);

  const triggerAttendanceCheck = useCallback(() => {
    if (!activeCall) return;
    engagementSocketRef.current?.emit("triggerAttendanceCheck", { classroomId: activeCall.classroomId });
  }, [activeCall]);

  const respondToPopQuestion = useCallback((answer: string) => {
    if (!activeCall || !pendingPopQuestion) return;
    engagementSocketRef.current?.emit("respondToPopQuestion", {
      popQuestionId: pendingPopQuestion.id,
      classroomId: activeCall.classroomId,
      answer,
    });
    setPendingPopQuestion(null);
    toast.success("Answer submitted");
  },
  [activeCall, pendingPopQuestion],
);

  const triggerPopQuestion = useCallback(
    (question: string, answer: string) => {
      if (!activeCall) return;
      engagementSocketRef.current?.emit("triggerPopQuestion", {
        classroomId: activeCall.classroomId,
        question,
        answer,
      });
    },
    [activeCall],
  );

  return (
    <MeetingContext.Provider
      value={{
        activeCall,
        isMinimized,
        startCall,
        leaveCall,
        endCallForEveryone,
        toggleMinimize,
        pendingAttendanceCheckId,
        lastAttendanceCheckId,
        respondToAttendance,
        triggerAttendanceCheck,
        pendingPopQuestion,
        lastPopQuestionId,
        respondToPopQuestion,
        triggerPopQuestion,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
}

export function useActiveCall() {
  const ctx = useContext(MeetingContext);
  if (!ctx)
    throw new Error("useActiveCall must be used within MeetingProvider");
  return ctx;
}
