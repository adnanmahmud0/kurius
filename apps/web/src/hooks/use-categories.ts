import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse, ICategory } from "@repo/types";

import { del, get, post, put } from "@/lib/api";

// 1. Get active categories (public)
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await get<ApiResponse<ICategory[]>>("/categories");
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5
  });
}

// 2. Get admin categories (paginated)
export function useAdminCategories(query?: { page?: number; limit?: number; search?: string }) {
  const page = query?.page || 1;
  const limit = query?.limit || 20;
  const search = query?.search || "";

  return useQuery({
    queryKey: ["admin", "categories", { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);

      const response = await get<ApiResponse<ICategory[]>>(
        `/categories/admin/all?${params.toString()}`
      );
      return {
        data: response.data || [],
        meta: response.meta
      };
    }
  });
}

// 3. Create Category (Admin)
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      thumbnail?: string | null;
      imageFile?: File | null;
    }) => {
      let dataToSend: any;
      let headers: any = undefined;

      if (payload.imageFile) {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("image", payload.imageFile);
        dataToSend = formData;
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        dataToSend = { name: payload.name, thumbnail: payload.thumbnail || null };
      }

      const response = await post<ApiResponse<ICategory>>(
        "/categories/admin",
        dataToSend,
        headers ? { headers } : undefined
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success(`Category "${data?.name}" created successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    }
  });
}

// 4. Update Category (Admin)
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload
    }: {
      id: string;
      payload: {
        name?: string;
        thumbnail?: string | null;
        imageFile?: File | null;
        status?: "active" | "delete";
      };
    }) => {
      let dataToSend: any;
      let headers: any = undefined;

      if (payload.imageFile) {
        const formData = new FormData();
        if (payload.name) formData.append("name", payload.name);
        if (payload.status) formData.append("status", payload.status);
        formData.append("image", payload.imageFile);
        dataToSend = formData;
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        dataToSend = {
          name: payload.name,
          thumbnail: payload.thumbnail,
          status: payload.status
        };
      }

      const response = await put<ApiResponse<ICategory>>(
        `/categories/admin/${id}`,
        dataToSend,
        headers ? { headers } : undefined
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success(`Category updated successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    }
  });
}

// 5. Delete Category (Admin)
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await del<ApiResponse<ICategory>>(`/categories/admin/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category deleted permanently.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    }
  });
}
