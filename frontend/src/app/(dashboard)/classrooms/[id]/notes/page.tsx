"use client";

import { useParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { NotesSection } from "@/components/notes/notes-section";
import { useClassroom } from "@/lib/classrooms/use-classrooms";

export default function NotesPage() {
  const params = useParams<{ id: string }>();

  const {
    data: classroom,
    isLoading,
    isError,
  } = useClassroom(params.id);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />

        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load notes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <NotesSection classroomId={classroom.id} />
    </div>
  );
}