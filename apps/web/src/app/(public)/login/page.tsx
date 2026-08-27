"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Loader2, Lock, Mail } from "lucide-react";

import { useLoginMutation } from "@/hooks/use-auth";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    await loginMutation.mutateAsync({
      email: email.trim(),
      password: password.trim()
    });
  };

  return (
    <Card className="border-border/80 w-full max-w-md border shadow-lg">
      <CardHeader className="space-y-1 pb-6 text-center">
        <div className="bg-primary text-primary-foreground mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold shadow-sm">
          K
        </div>
        <CardTitle className="text-foreground text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Enter your admin credentials to access the console
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="name@kurius.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">
                Password
              </Label>
            </div>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending || !email || !password}
            className="mt-2 w-full font-semibold"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In to Console"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="border-border/60 text-muted-foreground flex flex-col space-y-2 border-t pt-4 text-center text-xs">
        <p>
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
