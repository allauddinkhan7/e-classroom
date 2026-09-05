"use client";

import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import { Maximize2, Minimize2, Video, X } from "lucide-react";
import { useActiveCall } from "./meeting-context";
import { CallStage } from "./call-stage";
import { CallControls } from "./call-controls";

export function ActiveCallOverlay() {
  const { activeCall, isMinimized, toggleMinimize, leaveCall } = useActiveCall();

  if (!activeCall) return null;

  return (
    <LiveKitRoom
      video
      audio
      token={activeCall.token}
      serverUrl={activeCall.url}
      onDisconnected={leaveCall}
      data-lk-theme="default"
    >
      {isMinimized ? (
        // Small persistent window — bottom-right, real video, stays connected
        <div className="fixed bottom-4 right-4 z-50 w-[380px] overflow-hidden rounded-lg border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b p-2">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-blue-600 truncate text-sm font-medium">
                {activeCall.classroomName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                onClick={toggleMinimize}
                aria-label="Expand to full screen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                onClick={leaveCall}
                aria-label="Leave call"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-[220px]">
            <CallStage />
          </div>
          <CallControls />
        </div>
      ) : (
        // Full-screen expanded call
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b p-3">
            <p className="text-blue-600 text-sm font-medium">{activeCall.classroomName}</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <CallStage />
          </div>
          <CallControls />
        </div>
      )}
    </LiveKitRoom>
  );
}
