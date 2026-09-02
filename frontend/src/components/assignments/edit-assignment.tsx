"use client";

import { useEffect, useState } from "react";
import { Loader2, Paperclip, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEditAssignment, useUpdateAssignment } from "@/lib/assignments/use-assignments";
import { useUploadFile } from "@/lib/files/use-upload-file";

// Converts a full ISO string ("2026-12-31T23:59:00.000Z") into the
// "YYYY-MM-DDTHH:mm" format a <input type="datetime-local"> actually needs.
function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditAssignment({
  assignmentId,
  classroomId,
}: {
  assignmentId: string;
  classroomId: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [file, setFile] = useState<globalThis.File | null>(null);
  const [existingFileId, setExistingFileId] = useState<string | undefined>(undefined);

  const { data: assignment, isLoading } = useEditAssignment(assignmentId);
  const uploadFile = useUploadFile();
  const updateAssignment = useUpdateAssignment(classroomId, assignmentId);

  // Seed local form state from the fetched assignment ONCE it loads —
  // this runs when data first arrives, not on every render, so typing
  // afterward isn't overwritten by the server value.
  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setDescription(assignment.description ?? "");
      setTotalMarks(assignment.totalMarks.toString());
      setDueAt(toDatetimeLocalValue(assignment.dueAt));
      setExistingFileId(assignment.file?.id);
    }
  }, [assignment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueAt || !totalMarks) return;

    let fileId = existingFileId;
    if (file) {
      const uploaded = await uploadFile.mutateAsync(file);
      fileId = uploaded.id;
    }

    updateAssignment.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        totalMarks: Number(totalMarks),
        dueAt: new Date(dueAt).toISOString(),
        fileId,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  const isBusy = uploadFile.isPending || updateAssignment.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Edit</DialogTrigger>
      <DialogContent>
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit assignment</DialogTitle>
              <DialogDescription>Update the title, due date, or marks.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min={1}
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueAt">Due date</Label>
                  <Input
                    id="dueAt"
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">
                  {existingFileId ? "Replace attachment (optional)" : "Attachment (optional)"}
                </Label>
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" /> 
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isBusy || !title.trim() || !dueAt}>
                {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isBusy ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}