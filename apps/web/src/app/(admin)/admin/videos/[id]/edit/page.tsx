"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { useCategories } from "@/hooks/use-categories";
import { useUpdateVideo, useVideo } from "@/hooks/use-videos";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const { data: video, isLoading: isLoadingVideo } = useVideo(videoId);
  const { data: categories = [] } = useCategories();
  const updateVideoMutation = useUpdateVideo();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [status, setStatus] = useState<"active" | "delete">("active");

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setSubtitle(video.subtitle);
      setCategoryId(video.categoryId);
      setHashtags(video.hashtags ? video.hashtags.join(", ") : "");
      setStatus(video.status as "active" | "delete");
    }
  }, [video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim() || !categoryId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      categoryId,
      hashtags: hashtags
        .split(",")
        .map((s) => s.trim().replace(/^#/, ""))
        .filter(Boolean),
      status
    };

    try {
      await updateVideoMutation.mutateAsync({ id: videoId, formData: payload });
      router.push("/admin/videos");
    } catch {
      // Handled in mutation
    }
  };

  if (isLoadingVideo) {
    return (
      <Card className="border-border/80 mx-auto max-w-2xl border p-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-4 h-10 w-full" />
      </Card>
    );
  }

  if (!video) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm font-semibold">Video not found</p>
      </div>
    );
  }

  return (
    <Card className="border-border/80 mx-auto max-w-2xl border">
      <CardHeader className="border-border/60 flex flex-row items-center justify-between border-b pb-6">
        <div>
          <CardTitle className="text-xl font-bold">Edit Video Metadata</CardTitle>
          <CardDescription className="text-muted-foreground mt-0.5 text-xs">
            Update video details, category, tags, or publishing status
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Video Title *
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subtitle" className="text-xs font-semibold">
              Subtitle / Summary *
            </Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Publishing Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as "active" | "delete")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Published)</SelectItem>
                  <SelectItem value="delete">Inactive (Deactivated)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hashtags" className="text-xs font-semibold">
              Hashtags (Comma-separated)
            </Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="e.g. music, rap, live"
            />
          </div>

          <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={updateVideoMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateVideoMutation.isPending || !title.trim()}
              className="gap-2 font-semibold"
            >
              {updateVideoMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
