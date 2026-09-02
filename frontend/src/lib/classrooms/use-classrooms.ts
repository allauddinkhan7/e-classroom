"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchClassrooms,
  createClassroom,
  fetchClassroom,
  fetchAvailableStudents,
  addMembersBulk,
  updateClassroom,
} from "./classrooms-api";

export function useClassrooms() {
  return useQuery({
    queryKey: ["classrooms"],
    queryFn: fetchClassrooms,
  });
}

export function useCreateClassroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createClassroom(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast.success("Classroom created");
    },
    onError: () => {
      toast.error("Couldn't create the classroom — please try again");
    },
  });
}

export function useClassroom(id: string) {
  return useQuery({
    queryKey: ["classrooms", id],
    queryFn: () => fetchClassroom(id),
  });
}

export function useAvailableStudents(classroomId: string, search: string) {
  return useQuery({
    queryKey: ["classrooms", classroomId, "available-students", search],
    queryFn: () => fetchAvailableStudents(classroomId, search || undefined),
  });
}

export function useAddMembersBulk(classroomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => addMembersBulk(classroomId, userIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "available-students"],
      });
      toast.success(`Added ${data.added} student${data.added === 1 ? "" : "s"}`);
    },
    onError: () => {
      toast.error("Couldn't add students — please try again");
    },
  });
}

 export function useUpdateClassroom() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, name }: { id: string; name: string }) => updateClassroom(id, name),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["classrooms"] });
        queryClient.invalidateQueries({ queryKey: ["classrooms", variables.id] });
        toast.success("Classroom updated");
      },
      onError: () => toast.error("Couldn't update the classroom — please try again"),
    });
  }