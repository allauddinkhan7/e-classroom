"use client";

import { useState } from "react";
import { Loader2, Paperclip, Plus } from "lucide-react";
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
import { useCreateMaterial } from "@/lib/materials/use-materials";
import { useUploadFile } from "@/lib/files/use-upload-file";

export function CreateMaterialDialog({ classroomId }: { classroomId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<globalThis.File | null>(null);
  const uploadFile = useUploadFile();
  const createMaterial = useCreateMaterial(classroomId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    let fileId: string | undefined;
    if (file) {
      const uploaded = await uploadFile.mutateAsync(file);
      fileId = uploaded.id;
    }

    createMaterial.mutate(
      { title: title.trim(), fileId },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setFile(null);
        },
      },
    );
  }

  const isBusy = uploadFile.isPending || createMaterial.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-2 h-4 w-4" />
        Post Material
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Post course material</DialogTitle>
            <DialogDescription>Share slides, readings, or other resources.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="material-title">Title</Label>
              <Input
                id="material-title"
                placeholder="e.g. Week 1 Slides"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-file">File (optional)</Label>
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="material-file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isBusy || !title.trim()}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isBusy ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}