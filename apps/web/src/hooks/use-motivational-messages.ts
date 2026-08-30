import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse, IMotivationalMessage } from "@repo/types";

import { del, get, post, put } from "@/lib/api";

// 1. Get random motivational message (public)
export function useRandomMotivationalMessage() {
  return useQuery({
    queryKey: ["motivational-messages", "random"],
    queryFn: async () => {
      const response = await get<ApiResponse<IMotivationalMessage>>(
        "/motivational-messages/random"
      );
      return response.data;
    },
    staleTime: 0
  });
}

// 2. Get admin motivational messages (paginated)
export function useAdminMotivationalMessages(query?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "delete";
}) {
  const page = query?.page || 1;
  const limit = query?.limit || 20;
  const search = query?.search || "";
  const status = query?.status;

  return useQuery({
    queryKey: ["admin", "motivational-messages", { page, limit, search, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const response = await get<ApiResponse<IMotivationalMessage[]>>(
        `/motivational-messages?${params.toString()}`
      );
      return {
        data: response.data || [],
        pagination: response.meta
      };
    }
  });
}

// 3. Create single message
export function useCreateMotivationalMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { message: string; author?: string | null }) => {
      const response = await post<ApiResponse<IMotivationalMessage>>(
        "/motivational-messages/admin",
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "motivational-messages"] });
      queryClient.invalidateQueries({ queryKey: ["motivational-messages", "random"] });
      toast.success("Motivational quote created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create motivational quote");
    }
  });
}

// 4. Bulk create messages
export function useBulkCreateMotivationalMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      messages: Array<{ message: string; author?: string | null }>;
    }) => {
      const response = await post<ApiResponse<{ count: number }>>(
        "/motivational-messages/admin/bulk",
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "motivational-messages"] });
      queryClient.invalidateQueries({ queryKey: ["motivational-messages", "random"] });
      toast.success("Motivational quotes imported successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import motivational quotes");
    }
  });
}

// 5. Update message
export function useUpdateMotivationalMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload
    }: {
      id: string;
      payload: { message?: string; author?: string | null; status?: "active" | "delete" };
    }) => {
      const response = await put<ApiResponse<IMotivationalMessage>>(
        `/motivational-messages/admin/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "motivational-messages"] });
      queryClient.invalidateQueries({ queryKey: ["motivational-messages", "random"] });
      toast.success("Motivational quote updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update motivational quote");
    }
  });
}

// 6. Delete message
export function useDeleteMotivationalMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await del<ApiResponse<IMotivationalMessage>>(
        `/motivational-messages/admin/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "motivational-messages"] });
      queryClient.invalidateQueries({ queryKey: ["motivational-messages", "random"] });
      toast.success("Motivational quote deleted permanently.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete quote");
    }
  });
}
