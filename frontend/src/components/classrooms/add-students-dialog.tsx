"use client";

import { useState } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAvailableStudents, useAddMembersBulk } from "@/lib/classrooms/use-classrooms";

export function AddStudentsDialog({
  classroomId,
  classroomName,
}: {
  classroomId: string;
  classroomName: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: students, isLoading } = useAvailableStudents(classroomId, search);
  const addMembers = useAddMembersBulk(classroomId);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAdd() {
    addMembers.mutate(Array.from(selected), {
      onSuccess: () => {
        setOpen(false);
        setSelected(new Set());
        setSearch("");
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSelected(new Set());
          setSearch("");
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        <UserPlus className="mr-2 h-4 w-4" />
        Add Students
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Students to {classroomName}</DialogTitle>
          <DialogDescription>
            Search and select the students you want to add.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="h-64 rounded-md border">
          {isLoading ? (
            <div className="space-y-3 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : students && students.length > 0 ? (
            <div className="p-2">
              {students.map((student) => (
                <label
                  key={student.id}
                  htmlFor={student.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-secondary/50"
                >
                  <Checkbox
                    id={student.id}
                    checked={selected.has(student.id)}
                    onCheckedChange={() => toggle(student.id)}
                  />
                  <span className="flex-1 truncate font-medium">{student.fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {student.email}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {search ? "No students match your search" : "No students available to add"}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <span className="text-sm text-muted-foreground">Selected: {selected.size}</span>
          <Button onClick={handleAdd} disabled={selected.size === 0 || addMembers.isPending}>
            {addMembers.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {addMembers.isPending
              ? "Adding..."
              : `Add ${selected.size} Student${selected.size === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}