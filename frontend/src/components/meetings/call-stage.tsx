"use client";

import { useTracks, ParticipantTile, RoomAudioRenderer } from "@livekit/components-react";
import { Track } from "livekit-client";

export function CallStage() {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const columns = Math.max(1, Math.ceil(Math.sqrt(tracks.length)));

  return (
    <>
      <div
        className="grid h-full gap-2 p-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {tracks.map((trackRef) => (
          <ParticipantTile
            key={`${trackRef.participant.identity}-${trackRef.source}`}
            trackRef={trackRef}
            className="overflow-hidden rounded-lg"
          />
        ))}
      </div>
      <RoomAudioRenderer />
    </>
  );
}