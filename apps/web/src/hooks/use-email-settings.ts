import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse, IEmailSetting } from "@repo/types";

import { get, post, put } from "@/lib/api";

export function useEmailSettings() {
  return useQuery({
    queryKey: ["admin", "email-settings"],
    queryFn: async () => {
      const response = await get<ApiResponse<IEmailSetting>>("/admin/email");
      return response.data;
    }
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      provider?: "smtp" | "resend";
      host?: string | null;
      port?: number | null;
      secure?: boolean;
      user?: string | null;
      pass?: string | null;
      fromEmail?: string | null;
      fromName?: string | null;
    }) => {
      const response = await put<ApiResponse<IEmailSetting>>("/admin/email", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "email-settings"] });
      toast.success("Email & SMTP settings saved successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update email settings");
    }
  });
}

export function useTestEmailSettings() {
  return useMutation({
    mutationFn: async (payload: {
      toEmail: string;
      provider?: "smtp" | "resend";
      host?: string;
      port?: number;
      secure?: boolean;
      user?: string;
      pass?: string;
      fromEmail?: string;
      fromName?: string;
    }) => {
      const response = await post<ApiResponse<{ status: string; message: string }>>(
        "/admin/email/test",
        payload
      );
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Test email dispatched successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send test email. Please check credentials.");
    }
  });
}
