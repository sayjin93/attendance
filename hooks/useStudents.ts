import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services";
import type { Student } from "@/types";

export const studentKeys = {
  all: ["students"] as const,
  byClass: (classId: number | null) => ["students", "class", classId] as const,
};

export function useStudentsByClass(classId: number | null) {
  return useQuery<Student[]>({
    queryKey: studentKeys.byClass(classId),
    queryFn: () => studentService.getByClass(classId),
    enabled: !!classId,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}
