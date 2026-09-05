"use client";

import { useParams } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  Users,
  BookOpen,
  Video,
  FileText,
  NotebookPen,
  Users2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useClassroom } from "@/lib/classrooms/use-classrooms";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { AddStudentsDialog } from "@/components/classrooms/add-students-dialog";
import { EditClassroomDialog } from "@/components/classrooms/edit-classroom-dialog";
import { useActiveCall } from "@/lib/meetings/meeting-context";
import { Button } from "@/components/ui/button";
import ClassroomSection from "@/components/classrooms/classroom-section";

export default function ClassroomDetailPage() {
  const params = useParams<{ id: string }>();

  const { user } = useCurrentUser();
  const { startCall } = useActiveCall();

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
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />

        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load this classroom, or you don&apos;t have access to it.
        </p>
      </div>
    );
  }

  const isCourse = classroom.type === "COURSE";

  const classroomId = classroom.id;
  const classroomName = classroom.name;

  const myEnrollment = classroom.enrollments.find(
    (enrollment) => enrollment.user.id === user?.userId,
  );

  const canManageMembers = isCourse
    ? classroom.creator.id === user?.userId
    : myEnrollment?.roleInClass === "HOST";

  const canEdit = classroom.creator.id === user?.userId;

  function handleJoinClass() {
    startCall(classroomId, classroomName, canManageMembers);
  }

  const classroomSections = [
    {
      slug: "members",
      title: "Members",
      description: "Check and manage members of this classroom.",
      icon: Users2,
      gradient: "from-emerald-500 to-green-700",
    },
    {
      slug: "assignments",
      title: "Assignments",
      description: "View and manage assignments for this classroom.",
      icon: FileText,
      gradient: "from-blue-900 to-indigo-950",
    },
    {
      slug: "materials",
      title: "Materials",
      description: "View and manage materials for this classroom.",
      icon: BookOpen,
      gradient: "from-slate-700 to-slate-950",
    },
    {
      slug: "notes",
      title: "Notes",
      description: "View and manage notes for this classroom.",
      icon: NotebookPen,
      gradient: "from-teal-600 to-emerald-900",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Classroom Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {classroom.name}
            </h1>

            <Badge variant={isCourse ? "default" : "secondary"}>
              {isCourse ? "Course" : "Study Group"}
            </Badge>
          </div>

          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            {isCourse ? (
              <BookOpen className="h-3.5 w-3.5" />
            ) : (
              <Users className="h-3.5 w-3.5" />
            )}

            Created by {classroom.creator.fullName}
          </p>
          <button
            onClick={handleJoinClass}
            className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Video className="mr-2 h-4 w-4" />
            Join Class
          </button>

        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <EditClassroomDialog
              classroomId={classroom.id}
              currentName={classroom.name}
            />
          )}

          
        </div>
      </div>

      {/* Classroom Sections */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {classroomSections.map((section) => (
          <ClassroomSection
            key={section.slug}
            section={section}
            classroomId={classroom.id}
          />
        ))}
      </div>
    </div>
  );
}