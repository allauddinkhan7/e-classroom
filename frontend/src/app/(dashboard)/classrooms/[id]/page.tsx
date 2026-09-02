"use client";

import { useParams } from "next/navigation";
import { AlertCircle, Loader2, Users, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useClassroom } from "@/lib/classrooms/use-classrooms";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { AddStudentsDialog } from "@/components/classrooms/add-students-dialog";
import { AssignmentsSection } from "@/components/assignments/assignments-section";
import { EditClassroomDialog } from "@/components/classrooms/edit-classroom-dialog";
import { MaterialsSection } from "@/components/materials/materials-section";

export default function ClassroomDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useCurrentUser();
  const { data: classroom, isLoading, isError } = useClassroom(params.id);
  const canEdit = classroom?.creator.id === user?.userId;
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load this classroom, or you don&apos;t have access to it.
        </p>
      </div>
    );
  }

  const isCourse = classroom.type === "COURSE";
  const myEnrollment = classroom.enrollments.find((e) => e.user.id === user?.userId);
  const canManageMembers = isCourse
    ? classroom.creator.id === user?.userId
    : myEnrollment?.roleInClass === "HOST";
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col  gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{classroom.name}</h1>
            <Badge variant={isCourse ? "default" : "secondary"}>
              {isCourse ? "Course" : "Study Group"}
            </Badge>
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            {isCourse ? <BookOpen className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
            Created by {classroom.creator.fullName}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:flex-row sm:items-start">
        {canEdit && <EditClassroomDialog classroomId={classroom.id} currentName={classroom.name} />}
    
        {canManageMembers && (
          <AddStudentsDialog classroomId={classroom.id} classroomName={classroom.name} />
        )}

        </div>
        
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Members ({classroom.enrollments.length})
        </h2>
        <div className="divide-y rounded-lg border bg-background">
          {classroom.enrollments.map((enrollment) => (
            <div key={enrollment.id} className="flex items-center gap-3 p-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">
                  {enrollment.user.fullName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{enrollment.user.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{enrollment.user.email}</p>
              </div>
              {enrollment.roleInClass === "HOST" && (
                <Badge variant="outline" className="shrink-0">
                  {isCourse ? "Teacher" : "Host"}
                </Badge>
              )}
            </div>
          ))}
        </div>
        <AssignmentsSection classroomId={classroom.id} isTeacher={canManageMembers} />
        <MaterialsSection classroomId={classroom.id} isTeacher={canManageMembers} />
      </div>
    </div>
  );
}