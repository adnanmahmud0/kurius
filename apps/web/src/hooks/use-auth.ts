import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse, IUser } from "@repo/types";

import { get, post } from "@/lib/api";
import { cookie } from "@/lib/cookie-client";

import { useAuth } from "@/providers/AuthProvider";

import type { AuthUser, LoginCredentials, SignupCredentials } from "@/types";

export { useAuth };

interface LoginApiResult {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
}

export function useLoginMutation() {
  const { login } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await post<ApiResponse<LoginApiResult>>("/auth/login", credentials);
      return response;
    },
    onSuccess: (response) => {
      if (response.data?.accessToken) {
        login(response.data.accessToken, response.data.user);
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        toast.success(response.message || "Welcome back! Login successful.");
        router.push("/admin");
      }
    },
    onError: (error: any, variables) => {
      const msg = error.message || "Failed to log in";
      toast.error(msg);

      // If account requires verification, navigate to /verify-otp with email
      if (
        msg.toLowerCase().includes("verify your account") ||
        msg.toLowerCase().includes("verification otp")
      ) {
        router.push(`/verify-otp?email=${encodeURIComponent(variables.email)}`);
      }
    }
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { name: string; email: string; password: string }) => {
      const response = await post<ApiResponse<{ email: string }>>("/auth/register", credentials);
      return response;
    },
    onSuccess: (response, variables) => {
      toast.success(response.message || "Account created! Please check your email for the OTP.");
      router.push(`/verify-otp?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create account");
    }
  });
}

export function useVerifyOtpMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: { email: string; oneTimeCode: number }) => {
      const response = await post<ApiResponse<unknown>>("/auth/verify-email", payload);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Email verified successfully! You can now log in.");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid or expired OTP");
    }
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await post<ApiResponse<unknown>>("/auth/forget-password", { email });
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "A new OTP has been sent to your email.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend OTP");
    }
  });
}

export function useUserProfileQuery(enabled = true) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const response = await get<ApiResponse<IUser>>("/user/profile");
      return response.data;
    },
    enabled: isAuthenticated && enabled,
    staleTime: 1000 * 60 * 5
  });
}

export const useSignupMutation = useRegisterMutation;
