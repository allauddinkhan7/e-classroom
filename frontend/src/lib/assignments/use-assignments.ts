"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAssignments,
  createAssignment,
  submitAssignment,
  fetchSubmissions,
  gradeSubmission,
  fetchAssignment,
  updateAssignment,
} from "./assignments-api";

export function useAssignments(classroomId: string) {
  return useQuery({
    queryKey: ["classrooms", classroomId, "assignments"],
    queryFn: () => fetchAssignments(classroomId),
  });
}

export function useEditAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ["assignments", assignmentId, "edit"],
    queryFn: () => fetchAssignment(assignmentId),
  });
}
export function useUpdateAssignment(classroomId: string, assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title?: string;
      description?: string;
      totalMarks?: number;
      dueAt?: string;
      fileId?: string;
    }) => updateAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId, "assignments"] });
      toast.success("Assignment updated");
    },
    onError: () => toast.error("Couldn't update the assignment — please try again"),
  });
}

export function useCreateAssignment(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; totalMarks: number; dueAt: string; fileId?: string }) =>
      createAssignment(classroomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId, "assignments"] });
      toast.success("Assignment created");
    },
    onError: () => toast.error("Couldn't create the assignment — please try again"),
  });
}

export function useSubmitAssignment(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({assignmentId, fileId}: {assignmentId: string, fileId?: string }) => submitAssignment(assignmentId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId, "assignments"] });
      toast.success("Assignment submitted");
    },
    onError: (error: any) => {
      const message =
        error?.response?.status === 400
          ? error.response.data?.message || "Couldn't submit — check the due date"
          : "Couldn't submit — please try again";
      toast.error(message);
    },
  });
}

export function useSubmissions(assignmentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["assignments", assignmentId, "submissions"],
    queryFn: () => fetchSubmissions(assignmentId),
    enabled,
  });
}

export function useGradeSubmission(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, obtainedMarks }: { submissionId: string; obtainedMarks: number }) =>
      gradeSubmission(submissionId, obtainedMarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", assignmentId, "submissions"] });
      toast.success("Grade saved");
    },
    onError: () => toast.error("Couldn't save the grade — please try again"),
  });
}