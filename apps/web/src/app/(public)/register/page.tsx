"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Loader2, Lock, Mail, User } from "lucide-react";

import { useRegisterMutation } from "@/hooks/use-auth";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    await registerMutation.mutateAsync({
      name: name.trim(),
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
          Create Account
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Sign up to receive an OTP verification code via email
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              Full Name
            </Label>
            <div className="relative">
              <User className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
                required
                autoFocus
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password (Min. 6 characters)
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={registerMutation.isPending || !name || !email || !password}
            className="mt-2 w-full font-semibold"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="border-border/60 text-muted-foreground flex flex-col space-y-2 border-t pt-4 text-center text-xs">
        <p>
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
