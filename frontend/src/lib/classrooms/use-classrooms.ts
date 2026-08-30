"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchClassrooms, createClassroom } from "./classrooms-api";

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