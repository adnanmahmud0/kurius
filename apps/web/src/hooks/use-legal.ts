import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse, ILegalPolicy } from "@repo/types";

import { get, put } from "@/lib/api";

export function useLegalPolicy(type: "privacy" | "terms") {
  return useQuery({
    queryKey: ["legal", type],
    queryFn: async () => {
      const response = await get<ApiResponse<ILegalPolicy>>(`/legal/${type}`);
      return response.data;
    }
  });
}

export function useUpdateLegalPolicy(type: "privacy" | "terms") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title?: string; content: string }) => {
      const response = await put<ApiResponse<ILegalPolicy>>(`/legal/${type}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["legal", type] });
      toast.success(
        `${data?.title || (type === "terms" ? "Terms of Service" : "Privacy Policy")} updated successfully!`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update legal policy");
    }
  });
}
