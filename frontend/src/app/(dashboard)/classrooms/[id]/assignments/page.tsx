"use client";

import { useParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { AssignmentsSection } from "@/components/assignments/assignments-section";
import { useClassroom } from "@/lib/classrooms/use-classrooms";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export default function AssignmentsPage() {
  const params = useParams<{ id: string }>();

  const { user } = useCurrentUser();

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
          Couldn&apos;t load assignments.
        </p>
      </div>
    );
  }

  const isTeacher =
    classroom.type === "COURSE" &&
    classroom.creator.id === user?.userId;

  return (
    <div>
      <AssignmentsSection
        classroomId={classroom.id}
        isTeacher={isTeacher}
      />
    </div>
  );
}