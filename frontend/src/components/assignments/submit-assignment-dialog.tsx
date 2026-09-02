"use client";

import { useState } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSubmitAssignment } from "@/lib/assignments/use-assignments";
import { useUploadFile } from "@/lib/files/use-upload-file";

export function SubmitAssignmentDialog({
  assignmentId,
  classroomId,
}: {
  assignmentId: string;
  classroomId: string;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<globalThis.File | null>(null);
  const uploadFile = useUploadFile();
  const submit = useSubmitAssignment(classroomId);

  async function handleSubmit() {
    let fileId: string | undefined;
    if (file) {
      const uploaded = await uploadFile.mutateAsync(file);
      fileId = uploaded.id;
    }
    submit.mutate(
      { assignmentId, fileId },
      { onSuccess: () => setOpen(false) },
    );
  }

  const isBusy = uploadFile.isPending || submit.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>Submit</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit assignment</DialogTitle>
          <DialogDescription>Attach a file if required, then submit.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="submission-file">File (optional)</Label>
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <Input
              id="submission-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isBusy}>
            {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isBusy ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}