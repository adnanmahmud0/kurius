import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse, IStorageSetting } from "@repo/types";

import { get, post, put } from "@/lib/api";

export function useStorageSettings() {
  return useQuery({
    queryKey: ["admin", "storage-settings"],
    queryFn: async () => {
      const response = await get<ApiResponse<IStorageSetting>>("/admin/storage");
      return response.data;
    }
  });
}

export function useUpdateStorageSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      provider: "local" | "cloudinary";
      cloudName?: string | null;
      apiKey?: string | null;
      apiSecret?: string | null;
    }) => {
      const response = await put<ApiResponse<IStorageSetting>>("/admin/storage", payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "storage-settings"] });
      toast.success(`Storage provider updated to ${data?.provider.toUpperCase()}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update storage settings");
    }
  });
}

export function useTestStorageConnection() {
  return useMutation({
    mutationFn: async (payload: { cloudName: string; apiKey: string; apiSecret: string }) => {
      const response = await post<ApiResponse<{ status: string; message: string }>>(
        "/admin/storage/test",
        payload
      );
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Successfully connected to Cloudinary!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Connection failed. Please check credentials.");
    }
  });
}
