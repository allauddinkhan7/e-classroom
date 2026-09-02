"use client";

import {
  AlertCircle,
  CalendarClock,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useAssignments,
  useSubmitAssignment,
} from "@/lib/assignments/use-assignments";
import { SubmissionsDialog } from "./submissions-dialog";
import { FileDownloadLink } from "@/lib/files/file-download-link";
import { SubmitAssignmentDialog } from "./submit-assignment-dialog";
import { EditAssignment } from "./edit-assignment";
import { CreateAssignmentDialog } from "./create-assignment-dialog";
export function AssignmentsSection({
  classroomId,
  isTeacher,
}: {
  classroomId: string;
  isTeacher: boolean;
}) {
  const { data: assignments, isLoading, isError } = useAssignments(classroomId);
  const submit = useSubmitAssignment(classroomId);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Assignments
        </h2>
        {isTeacher && <CreateAssignmentDialog classroomId={classroomId} />}
      </div>

      {isLoading && (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-lg border text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load assignments
          </p>
        </div>
      )}

      {!isLoading && !isError && assignments?.length === 0 && (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-center">
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No assignments yet</p>
        </div>
      )}

      {!isLoading && !isError && assignments && assignments.length > 0 && (
        <div className="space-y-2">
          {assignments.map((a) => {
            const mySubmission = a.submissions[0];
            const isPastDue = new Date() > new Date(a.dueAt);
            return (
              <Card key={a.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.description && (
                      <p className="text-sm text-muted-foreground">
                        {a.description}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="h-3 w-3" />
                      Due {new Date(a.dueAt).toLocaleString()} · {a.totalMarks}{" "}
                      marks
                    </p>
                   
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isTeacher ? (
                     <>
                      <SubmissionsDialog
                        assignmentId={a.id}
                        assignmentTitle={a.title}
                        totalMarks={a.totalMarks}
                      />
                       <EditAssignment 
                        assignmentId={a.id}
                        classroomId={classroomId}
                        />
                     </>
                      
                    ) : mySubmission ? (
                      <Badge
                        variant={
                          mySubmission.obtainedMarks != null
                            ? "default"
                            : "secondary"
                        }
                      >
                        {mySubmission.obtainedMarks != null
                          ? `Graded: ${mySubmission.obtainedMarks}/${a.totalMarks}`
                          : "Submitted"}
                      </Badge>
                    ) : isPastDue ? (
                      <Badge variant="outline">Past due</Badge>
                    ) : (
                    <div className="flex flex-col gap-5 items-center gap-2">
                        {a.file && (
                        <FileDownloadLink
                          fileId={a.file.id}
                          label={a.file.originalName}
                        />
                      )}
                      <SubmitAssignmentDialog
                        assignmentId={a.id}
                        classroomId={classroomId}
                        />
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
