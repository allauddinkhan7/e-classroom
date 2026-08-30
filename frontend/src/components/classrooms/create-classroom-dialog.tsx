"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { useCreateClassroom } from "@/lib/classrooms/use-classrooms";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export function CreateClassroomDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { user } = useCurrentUser();
  const createClassroom = useCreateClassroom();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createClassroom.mutate(name.trim(), {
      onSuccess: () => {
        setOpen(false);
        setName("");
      },
    });
  }

  const isTeacher = user?.role === "TEACHER";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        {isTeacher ? "Create Classroom" : "Create Study Group"}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isTeacher ? "Create a classroom" : "Create a study group"}</DialogTitle>
            <DialogDescription>
              {isTeacher
                ? "Give your classroom a name — you can add students once it's created."
                : "Give your study group a name — you can invite friends once it's created."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="classroom-name">Name</Label>
            <Input
              id="classroom-name"
              placeholder={isTeacher ? "e.g. Data Structures" : "e.g. Finals Study Group"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createClassroom.isPending || !name.trim()}>
              {createClassroom.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createClassroom.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}