import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/services";
import type { Class } from "@/types";

export const classKeys = {
  all: ["classes"] as const,
  byProfessor: (professorId: string) => ["classes", "professor", professorId] as const,
  withDetails: (professorId: string) => ["classes", "details", professorId] as const,
};

export function useClasses(enabled = true) {
  return useQuery<Class[]>({
    queryKey: classKeys.all,
    queryFn: () => classService.getAll(),
    enabled,
  });
}

export function useClassesByProfessor(professorId: string) {
  return useQuery<Class[]>({
    queryKey: classKeys.byProfessor(professorId),
    queryFn: () => classService.getByProfessor(professorId),
    enabled: !!professorId,
  });
}

export function useClassesWithDetails(professorId: string) {
  return useQuery<Class[]>({
    queryKey: classKeys.withDetails(professorId),
    queryFn: () => classService.getWithLecturesAndStudents(professorId),
    enabled: !!professorId,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
    },
  });
}
