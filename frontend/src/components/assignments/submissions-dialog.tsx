"use client";

import { useState } from "react";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSubmissions, useGradeSubmission } from "@/lib/assignments/use-assignments";
import { FileDownloadLink } from "@/lib/files/file-download-link";

function GradeRow({
  submission,
  totalMarks,
  assignmentId,
}: {
  submission: { id: string; obtainedMarks: number | null; user: { fullName: string; email: string }, file: { id: string; originalName: string } | null };
  totalMarks: number;
  assignmentId: string;
}) {
  const [marks, setMarks] = useState(submission.obtainedMarks?.toString() ?? "");
  const grade = useGradeSubmission(assignmentId);

  function save() {
    const value = Number(marks);
    if (Number.isNaN(value) || value < 0 || value > totalMarks) return;
    grade.mutate({ submissionId: submission.id, obtainedMarks: value });
  }

  return (
    <div className="flex items-center gap-3 p-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {submission.user.fullName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{submission.user.fullName}</p>
        <p className="truncate text-xs text-muted-foreground">{submission.user.email}</p>
        {submission.file && (
          <FileDownloadLink fileId={submission.file.id} label={submission.file.originalName} />
        )}
      </div>
      <Input
        type="number"
        min={0}
        max={totalMarks}
        value={marks}
        onChange={(e) => setMarks(e.target.value)}
        className="w-16 text-center"
        placeholder="—"
      />
      <span className="text-xs text-muted-foreground">/ {totalMarks}</span>
      <Button size="sm" variant="secondary" onClick={save} disabled={grade.isPending}>
        {grade.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
      </Button>
    </div>
  );
}

export function SubmissionsDialog({
  assignmentId,
  assignmentTitle,
  totalMarks,
}: {
  assignmentId: string;
  assignmentTitle: string;
  totalMarks: number;
}) {
  const [open, setOpen] = useState(false);
  const { data: submissions, isLoading } = useSubmissions(assignmentId, open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Users className="mr-2 h-3.5 w-3.5" />
        Submissions
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submissions — {assignmentTitle}</DialogTitle>
          <DialogDescription>Enter marks and save per student.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-72 rounded-md border">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="divide-y">
              {submissions.map((s) => (
                <GradeRow key={s.id} submission={s} totalMarks={totalMarks} assignmentId={assignmentId} />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No submissions yet
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}