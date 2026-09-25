"use client";

import { TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Minimize2, PhoneOff, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveCall } from "./meeting-context";
import { AttendanceResultsDialog } from "./attendance-results-dialog";

export function CallControls() {
  const { activeCall, leaveCall, endCallForEveryone, toggleMinimize, triggerAttendanceCheck } = useActiveCall();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t bg-background p-3">
      <TrackToggle
        source={Track.Source.Microphone}
        showIcon
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80"
      />

      <TrackToggle
        source={Track.Source.Camera}
        showIcon
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80"
      />

      <TrackToggle
        source={Track.Source.ScreenShare}
        showIcon
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80"
      />

      <Button variant="secondary" size="icon" className="rounded-full" onClick={toggleMinimize}>
        <Minimize2 className="h-4 w-4" />
      </Button>

      {activeCall?.isHost && (
        <>
          <Button variant="secondary" className="rounded-full" onClick={triggerAttendanceCheck}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Take Attendance
          </Button>
          <AttendanceResultsDialog />
        </>
      )}

      {activeCall?.isHost ? (
        <Button variant="destructive" className="rounded-full" onClick={endCallForEveryone}>
          <PhoneOff className="mr-2 h-4 w-4" />
          End for everyone
        </Button>
      ) : (
        <Button variant="destructive" className="rounded-full" onClick={leaveCall}>
          <PhoneOff className="mr-2 h-4 w-4" />
          Leave
        </Button>
      )}
    </div>
  );
}