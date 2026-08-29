import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse, IUser } from "@repo/types";

import { del, get, patch } from "@/lib/api";

interface UserListResponse {
  pagination?: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
  data?: IUser[];
}

export function useAdminUsers(query?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
}) {
  const page = query?.page || 1;
  const limit = query?.limit || 10;
  const searchTerm = query?.searchTerm || "";
  const sort = query?.sort || "-createdAt";

  return useQuery({
    queryKey: ["admin", "users", { page, limit, searchTerm, sort }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (searchTerm) params.set("searchTerm", searchTerm);
      if (sort) params.set("sort", sort);

      const response = await get<UserListResponse>(`/user?${params.toString()}`);
      return {
        data: response.data || [],
        pagination: response.pagination
      };
    }
  });
}

export function useAdminUserDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: async () => {
      const response = await get<ApiResponse<IUser>>(`/user/${id}`);
      return response.data;
    },
    enabled: Boolean(id) && enabled
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await del<ApiResponse<null>>(`/user/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User account deleted permanently.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user account.");
    }
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status?: "active" | "delete" }) => {
      const response = await patch<ApiResponse<null>>(`/user/${id}/status`, { status });
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user"] });
      toast.success(data?.message || "User status updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user status.");
    }
  });
}
