"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
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
import { useCreateAssignment } from "@/lib/assignments/use-assignments";
import { Paperclip } from "lucide-react";
import { useUploadFile } from "@/lib/files/use-upload-file";

export function CreateAssignmentDialog({ classroomId } : { classroomId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [dueAt, setDueAt] = useState("");
  const [file, setFile] = useState<globalThis.File | null>(null);
  const uploadFile = useUploadFile();
  const createAssignment = useCreateAssignment(classroomId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueAt || !totalMarks) return;
    let fileId: string | undefined;
    if (file) {
      const uploaded = await uploadFile.mutateAsync(file);
      fileId = uploaded.id;
    }
    createAssignment.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        totalMarks: Number(totalMarks),
        dueAt: new Date(dueAt).toISOString(),
        fileId,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setDescription("");
          setTotalMarks("100");
          setDueAt("");
          setFile(null);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-2 h-4 w-4" />
        New Assignment
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader> 
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>
              Set a title, due date, and total marks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Homework 1"
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Instructions for students..."
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
              <div className="space-y-2">
                <Label htmlFor="file">Attachment (optional)</Label>
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
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createAssignment.isPending || !title.trim() || !dueAt}
            >
              {createAssignment.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createAssignment.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
