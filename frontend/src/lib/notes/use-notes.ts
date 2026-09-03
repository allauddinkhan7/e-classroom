"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchNotes, createNote, deleteNote, updateNote } from "./notes-api";

export function useNotes(classroomId: string) {
  return useQuery({
    queryKey: ["classrooms", classroomId, "notes"],
    queryFn: () => fetchNotes(classroomId),
  });
}

export function useCreateNote(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createNote(classroomId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId, "notes"] });
    },
    onError: () => toast.error("Couldn't save the note — please try again"),
  });
}

export function useDeleteNote(classroomId: string) {
  const queryClient = useQueryClient(); 
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId, "notes"] });
    },
    onError: () => toast.error("Couldn't delete the note — please try again"),
  });
}

export function useUpdateNote(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId, "notes"] });
    },
    onError: () => toast.error("Couldn't save the note — please try again"),
  });
}