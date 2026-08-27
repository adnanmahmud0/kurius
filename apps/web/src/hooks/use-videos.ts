import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse, IVideo } from "@repo/types";

import { api, del, get, put } from "@/lib/api";

// 1. Get admin videos list (page/limit pagination)
export function useAdminVideos(query?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
}) {
  const page = query?.page || 1;
  const limit = query?.limit || 20;
  const search = query?.search || "";
  const categoryId = query?.categoryId || "";
  const status = query?.status || "";

  return useQuery({
    queryKey: ["admin", "videos", { page, limit, search, categoryId, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId);
      if (status) params.set("status", status);

      const response = await get<ApiResponse<IVideo[]>>(`/videos/admin/all?${params.toString()}`);
      return {
        data: response.data || [],
        meta: response.meta
      };
    }
  });
}

// 2. Get single video by ID
export function useVideo(id: string, enabled = true) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const response = await get<ApiResponse<IVideo>>(`/videos/${id}`);
      return response.data;
    },
    enabled: Boolean(id) && enabled
  });
}

// 3. Upload & Create Video (Admin) with multipart/form-data
export function useUploadVideo(onUploadProgress?: (progress: number) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post<ApiResponse<IVideo>>("/videos/admin", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percent);
          }
        }
      });
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "videos"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(response.message || "Video uploaded successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload video");
    }
  });
}

// 4. Update Video (Admin)
export function useUpdateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData
    }: {
      id: string;
      formData: FormData | Record<string, any>;
    }) => {
      if (formData instanceof FormData) {
        const response = await api.put<ApiResponse<IVideo>>(`/videos/admin/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        return response.data;
      } else {
        const response = await put<ApiResponse<IVideo>>(`/videos/admin/${id}`, formData);
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "videos"] });
      toast.success("Video updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update video");
    }
  });
}

// 5. Delete / Deactivate Video (Admin)
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await del<ApiResponse<IVideo>>(`/videos/admin/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "videos"] });
      toast.success("Video deactivated successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete video");
    }
  });
}
