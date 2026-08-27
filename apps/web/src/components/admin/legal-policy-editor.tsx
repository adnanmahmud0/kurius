"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { ExternalLink, FileText, Loader2, Save, Shield } from "lucide-react";
import { toast } from "sonner";

import { useLegalPolicy, useUpdateLegalPolicy } from "@/hooks/use-legal";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

interface LegalPolicyEditorProps {
  type: "privacy" | "terms";
}

export function LegalPolicyEditor({ type }: LegalPolicyEditorProps) {
  const { data: policy, isLoading } = useLegalPolicy(type);
  const updateMutation = useUpdateLegalPolicy(type);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (policy) {
      setTitle(policy.title);
      setContent(policy.content);
    }
  }, [policy]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Policy content cannot be empty.");
      return;
    }

    await updateMutation.mutateAsync({
      title: title.trim() || undefined,
      content: content.trim()
    });
  };

  const isPrivacy = type === "privacy";
  const publicPath = isPrivacy ? "/privacy" : "/terms";

  if (isLoading) {
    return (
      <Card className="border-border/80 mx-auto max-w-4xl border p-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  return (
    <Card className="border-border/80 mx-auto max-w-4xl border">
      <CardHeader className="border-border/60 flex flex-col border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg p-2.5 ${isPrivacy ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-500"}`}
          >
            {isPrivacy ? <Shield className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
          </div>
          <div>
            <CardTitle className="text-xl font-bold">
              Edit {isPrivacy ? "Privacy Policy" : "Terms of Service"}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-0.5 text-xs">
              Update legal policy text displayed on the public website and mobile app
            </CardDescription>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 sm:mt-0">
          <Link href={publicPath} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <ExternalLink className="h-3.5 w-3.5" />
              View Live Page
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="policy-title" className="text-xs font-semibold">
              Document Title
            </Label>
            <Input
              id="policy-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isPrivacy ? "Privacy Policy" : "Terms of Service"}
              required
            />
          </div>

          <Tabs defaultValue="edit" className="w-full">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs font-semibold">Document Body (Markdown Supported) *</Label>
              <TabsList className="h-8">
                <TabsTrigger value="edit" className="px-3 text-xs">
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="px-3 text-xs">
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="mt-0">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write policy content in Markdown format..."
                rows={16}
                className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border p-4 font-mono text-sm leading-relaxed shadow-xs focus-visible:ring-1 focus-visible:outline-none"
                required
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="border-border bg-muted/20 text-foreground/90 min-h-[380px] rounded-md border p-6 text-sm leading-relaxed whitespace-pre-wrap">
                {content || (
                  <span className="text-muted-foreground italic">No content to preview</span>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-border flex items-center justify-between border-t pt-4">
            {policy?.updatedAt ? (
              <p className="text-muted-foreground text-xs">
                Last updated:{" "}
                <strong className="text-foreground">
                  {new Date(policy.updatedAt).toLocaleString()}
                </strong>
              </p>
            ) : (
              <div />
            )}

            <Button
              type="submit"
              disabled={updateMutation.isPending || !content.trim()}
              className="gap-2 font-semibold"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Policy...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Policy
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
