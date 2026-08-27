"use client";

import React from "react";
import Link from "next/link";

import { ArrowLeft, Shield } from "lucide-react";

import { useLegalPolicy } from "@/hooks/use-legal";

import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

export default function PrivacyPage() {
  const { data: policy, isLoading } = useLegalPolicy("privacy");

  return (
    <Card className="border-border/80 w-full max-w-4xl border shadow-md">
      <CardHeader className="border-border/60 flex flex-row items-center justify-between border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2.5">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {policy?.title || "Privacy Policy"}
            </CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Last updated:{" "}
              {policy?.updatedAt
                ? new Date(policy.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })
                : new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
            </p>
          </div>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" />
            Back to Console
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="prose prose-neutral dark:prose-invert text-foreground/90 max-w-none text-sm leading-relaxed whitespace-pre-wrap">
            {policy?.content}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
