"use client";

import { useParams } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useClassroom } from "@/lib/classrooms/use-classrooms";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { AddStudentsDialog } from "@/components/classrooms/add-students-dialog";

export default function MembersPage() {
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />

        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load members.
        </p>
      </div>
    );
  }

  const isCourse = classroom.type === "COURSE";

  const myEnrollment = classroom.enrollments.find(
    (enrollment) => enrollment.user.id === user?.userId,
  );

  const canManageMembers = isCourse
    ? classroom.creator.id === user?.userId
    : myEnrollment?.roleInClass === "HOST";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />

            <h1 className="text-xl font-semibold">
              Members
            </h1>

            <Badge variant="secondary">
              {classroom.enrollments.length}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            People who are part of this classroom.
          </p>
        </div>

        {canManageMembers && (
          <AddStudentsDialog
            classroomId={classroom.id}
            classroomName={classroom.name}
          />
        )}
      </div>

      {/* Members */}
      <div className="divide-y rounded-xl border bg-white">
        {classroom.enrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className="flex items-center gap-3 p-4"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-xs">
                {enrollment.user.fullName
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {enrollment.user.fullName}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {enrollment.user.email}
              </p>
            </div>

            {enrollment.roleInClass === "HOST" && (
              <Badge variant="outline">
                {isCourse ? "Teacher" : "Host"}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}