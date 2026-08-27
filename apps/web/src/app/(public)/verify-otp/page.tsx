"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { KeyRound, Loader2, MailCheck, RefreshCw } from "lucide-react";

import { useResendOtpMutation, useVerifyOtpMutation } from "@/hooks/use-auth";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState("");

  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otpCode.trim()) return;

    await verifyOtpMutation.mutateAsync({
      email: email.trim(),
      oneTimeCode: Number(otpCode.trim())
    });
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    await resendOtpMutation.mutateAsync(email.trim());
  };

  return (
    <Card className="border-border/80 w-full max-w-md border shadow-lg">
      <CardHeader className="space-y-1 pb-6 text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl shadow-xs">
          <MailCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-foreground text-2xl font-bold tracking-tight">
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Enter the 6-digit one-time code sent to your email address
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@kurius.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-xs font-semibold">
              6-Digit OTP Code
            </Label>
            <div className="relative">
              <KeyRound className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="pl-9 text-center font-mono text-lg font-bold tracking-widest"
                required
                autoFocus
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={verifyOtpMutation.isPending || otpCode.length < 4 || !email}
            className="mt-2 w-full font-semibold"
          >
            {verifyOtpMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying code...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resendOtpMutation.isPending || !email}
            className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${resendOtpMutation.isPending ? "animate-spin" : ""}`}
            />
            Resend OTP code
          </Button>
        </div>
      </CardContent>

      <CardFooter className="border-border/60 text-muted-foreground flex flex-col space-y-2 border-t pt-4 text-center text-xs">
        <p>
          Back to{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md p-8 text-center text-sm">Loading verification...</Card>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
