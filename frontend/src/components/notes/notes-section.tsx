"use client";

import { useState } from "react";
import { AlertCircle, Loader2, NotebookPen, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/lib/notes/use-notes";

export function NotesSection({ classroomId }: { classroomId: string }) {
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: notes, isLoading, isError } = useNotes(classroomId);
  const createNote = useCreateNote(classroomId);
  const updateNote = useUpdateNote(classroomId);
  const deleteNote = useDeleteNote(classroomId);

  const isEditing = editingId !== null;
  const isBusy = createNote.isPending || updateNote.isPending;

  function startEditing(noteId: string, noteContent: string) {
    setEditingId(noteId);
    setContent(noteContent);
  }

  function cancelEditing() {
    setEditingId(null);
    setContent("");
  }

  function handleSave() {
    if (!content.trim()) return;

    if (isEditing) {
      updateNote.mutate(
        { id: editingId!, content: content.trim() }, //editingId! ->  The ! is called the non-null assertion means "TypeScript, I know this value isn't null or `undefined here. Trust me." --------- Why does TypeScript complain without it?  Because we declared: editingId: string | null
        { onSuccess: () => cancelEditing() },
      );
    } else {
      createNote.mutate(content.trim(), { onSuccess: () => setContent("") });
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">My Notes</h2>

      <div className="space-y-2">
        <Textarea
          placeholder="Make your notes..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
        />
        <div className="flex justify-end gap-2">
          {isEditing && (
            <Button variant="ghost" onClick={cancelEditing} disabled={isBusy}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isBusy || !content.trim()}>
            {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save" : "Add"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex min-h-[80px] items-center justify-center rounded-lg border">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-lg border text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm text-muted-foreground">Couldn&apos;t load your notes</p>
        </div>
      )}

      {!isLoading && !isError && notes?.length === 0 && (
        <div className="flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-center">
          <NotebookPen className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No notes yet — only you can see these</p>
        </div>
      )}

      {!isLoading && !isError && notes && notes.length > 0 && (
        <div className="space-y-2">
          {notes.map((note) => (
            <Card
              key={note.id}
              className={
                note.id === editingId ? "border-primary ring-1 ring-primary" : "cursor-pointer hover:bg-secondary/30"
              }
              onClick={() => note.id !== editingId && startEditing(note.id, note.content)}
            >
              <CardContent className="flex items-start justify-between gap-3 p-3">
                <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                {/* Delete Note Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation(); // don't trigger edit-mode when deleting
                    deleteNote.mutate(note.id);
                  }}
                  disabled={deleteNote.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}