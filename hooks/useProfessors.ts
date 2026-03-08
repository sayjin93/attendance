import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { professorService } from "@/services";
import type { Professor } from "@/types";

export const professorKeys = {
  all: ["professors"] as const,
  search: (search?: string) => ["professors", { search }] as const,
  detail: (id: number) => ["professors", id] as const,
};

export function useProfessors(search?: string) {
  return useQuery<Professor[]>({
    queryKey: professorKeys.search(search),
    queryFn: () => professorService.getAll(search),
  });
}

export function useCreateProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: professorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professorKeys.all });
    },
  });
}

export function useUpdateProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: professorService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professorKeys.all });
    },
  });
}

export function useDeleteProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: professorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professorKeys.all });
    },
  });
}
