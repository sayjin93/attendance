import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentService } from "@/services";

export const assignmentKeys = {
  all: ["assignments"] as const,
};

export function useAssignments() {
  return useQuery({
    queryKey: assignmentKeys.all,
    queryFn: () => assignmentService.getAll(),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      professorId: number;
      subjectId: number;
      classId: number;
      typeId: number;
    }) => assignmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}
