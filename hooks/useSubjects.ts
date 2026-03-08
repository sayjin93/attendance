import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectService } from "@/services";

export const subjectKeys = {
  all: ["subjects"] as const,
};

export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.all,
    queryFn: () => subjectService.getAll(),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subjectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subjectService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subjectService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
}
