"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchMaterials, createMaterial, deleteMaterial } from "./materials-api";

export function useMaterials(classroomId: string) {
  return useQuery({
    queryKey: ["classrooms", classroomId, "materials"],
    queryFn: () => fetchMaterials(classroomId),
  });
}

export function useCreateMaterial(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, fileId }: { title: string; fileId?: string }) =>
      createMaterial(classroomId, title, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId, "materials"] });
      toast.success("Material posted");
    },
    onError: () => toast.error("Couldn't post the material — please try again"),
  });
}

export function useDeleteMaterial(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId, "materials"] });
      toast.success("Material removed");
    },
    onError: () => toast.error("Couldn't remove the material — please try again"),
  });
}