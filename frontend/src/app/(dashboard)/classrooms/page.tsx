"use client";

import { AlertCircle, BookOpen, Loader2 } from "lucide-react";
import { useClassrooms } from "@/lib/classrooms/use-classrooms";
import { ClassroomCard } from "@/components/classrooms/classroom-card";
import { CreateClassroomDialog } from "@/components/classrooms/create-classroom-dialog";

export default function ClassroomsPage() {
  const { data: classrooms, isLoading, isError } = useClassrooms();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Classrooms</h1>
          <p className="text-sm text-muted-foreground">
            Courses and study groups you&apos;re part of
          </p>
        </div>
        <CreateClassroomDialog />
      </div>

      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load your classrooms. Please try again.
          </p>
        </div>
      )}

      {!isLoading && !isError && classrooms?.length === 0 && (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No classrooms yet</p>
          <p className="text-sm text-muted-foreground">
            Create one to get started.
          </p>
        </div>
      )}

      {!isLoading && !isError && classrooms && classrooms.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      )}
    </div>
  );
}