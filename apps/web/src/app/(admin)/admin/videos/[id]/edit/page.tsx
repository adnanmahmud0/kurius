"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Cloud,
  Eye,
  FileVideo,
  HardDrive,
  Heart,
  ImageIcon,
  Loader2,
  MessageSquare,
  Play,
  Save,
  Upload,
  Video as VideoIcon,
  X
} from "lucide-react";
import { toast } from "sonner";

import { getMediaUrl } from "@/lib/utils";

import { useCategories } from "@/hooks/use-categories";
import { useUpdateVideo, useVideo } from "@/hooks/use-videos";

import { Badge } from "@/ui/badge";
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

  // Optional replacement files
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newVideoPreviewUrl, setNewVideoPreviewUrl] = useState<string | null>(null);
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);
  const [newThumbnailPreviewUrl, setNewThumbnailPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setSubtitle(video.subtitle);
      setCategoryId(video.categoryId);
      setHashtags(video.hashtags ? video.hashtags.join(", ") : "");
      setStatus(video.status as "active" | "delete");
    }
  }, [video]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video file is too large (Maximum 500MB)");
        return;
      }
      setNewVideoFile(file);
      setNewVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveNewVideo = () => {
    if (newVideoPreviewUrl) URL.revokeObjectURL(newVideoPreviewUrl);
    setNewVideoFile(null);
    setNewVideoPreviewUrl(null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Thumbnail image is too large (Maximum 10MB)");
        return;
      }
      setNewThumbnailFile(file);
      setNewThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveNewThumbnail = () => {
    if (newThumbnailPreviewUrl) URL.revokeObjectURL(newThumbnailPreviewUrl);
    setNewThumbnailFile(null);
    setNewThumbnailPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim() || !categoryId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formattedTags = hashtags
      .split(/[,\s]+/)
      .map((s) => s.trim().replace(/^#/, ""))
      .filter(Boolean);

    try {
      if (newVideoFile || newThumbnailFile) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("subtitle", subtitle.trim());
        formData.append("categoryId", categoryId);
        formData.append("hashtags", JSON.stringify(formattedTags));
        formData.append("status", status);
        if (newVideoFile) formData.append("video", newVideoFile);
        if (newThumbnailFile) formData.append("thumbnail", newThumbnailFile);

        await updateVideoMutation.mutateAsync({ id: videoId, formData });
      } else {
        const payload = {
          title: title.trim(),
          subtitle: subtitle.trim(),
          categoryId,
          hashtags: formattedTags,
          status
        };
        await updateVideoMutation.mutateAsync({ id: videoId, formData: payload });
      }
      router.push("/admin/videos");
    } catch {
      // Handled in mutation
    }
  };

  if (isLoadingVideo) {
    return (
      <Card className="border-border/80 mx-auto max-w-4xl border p-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-4 h-64 w-full" />
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Edit Video & Media</h1>
          <p className="text-muted-foreground text-xs">
            Preview current playback, update metadata, tags, or replace media files
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Library
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Media Preview & Engagement (2 columns) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Live Video Player Preview Card */}
          <Card className="border-border/80 overflow-hidden border">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Current Playback Preview
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`gap-1 text-[10px] ${
                    video.storageType === "cloudinary"
                      ? "border-sky-500/30 text-sky-500"
                      : "border-amber-500/30 text-amber-500"
                  }`}
                >
                  {video.storageType === "cloudinary" ? (
                    <Cloud className="h-3 w-3" />
                  ) : (
                    <HardDrive className="h-3 w-3" />
                  )}
                  {video.storageType === "cloudinary" ? "Cloudinary" : "Local Disk"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-1">
              <div className="border-border relative aspect-video w-full overflow-hidden rounded-lg border bg-black shadow-inner">
                <video
                  key={newVideoPreviewUrl || video.id}
                  src={newVideoPreviewUrl || getMediaUrl(video.videoUrl)}
                  poster={newThumbnailPreviewUrl || getMediaUrl(video.thumbnailUrl)}
                  controls
                  playsInline
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Engagement Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-muted-foreground flex items-center justify-center gap-1 text-[10px]">
                    <Eye className="h-3 w-3" /> Views
                  </p>
                  <p className="text-foreground mt-0.5 text-xs font-bold">
                    {video.stats?.viewsCount || 0}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-muted-foreground flex items-center justify-center gap-1 text-[10px]">
                    <Heart className="h-3 w-3 text-rose-500" /> Likes
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-rose-500">
                    {video.stats?.likesCount || 0}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-muted-foreground flex items-center justify-center gap-1 text-[10px]">
                    <MessageSquare className="h-3 w-3 text-blue-500" /> Comments
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-blue-500">
                    {video.stats?.commentsCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Thumbnail Card */}
          <Card className="border-border/80 border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Thumbnail Cover
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="border-border h-28 w-full overflow-hidden rounded-lg border bg-black shadow-xs">
                {newThumbnailPreviewUrl || video.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={newThumbnailPreviewUrl || getMediaUrl(video.thumbnailUrl)}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
                    <ImageIcon className="mr-2 h-4 w-4" /> No custom thumbnail
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Edit Form (3 columns) */}
        <Card className="border-border/80 border lg:col-span-3">
          <CardHeader className="border-border/60 border-b pb-4">
            <CardTitle className="text-base font-bold">Video Details</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Modify video title, category, tags, or replace the media files
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Video Title *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
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
                  <Select
                    value={status}
                    onValueChange={(val) => setStatus(val as "active" | "delete")}
                  >
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
                  placeholder="e.g. nature, tutorial, music"
                />
              </div>

              {/* Optional Replacement File Pickers */}
              <div className="border-border space-y-3 border-t pt-2">
                <p className="text-muted-foreground text-xs font-bold uppercase">
                  Replace Media (Optional)
                </p>

                {/* Replace Video File */}
                <div>
                  <Label className="text-muted-foreground mb-1 block text-[11px]">
                    Upload New Video File
                  </Label>
                  {newVideoFile ? (
                    <div className="bg-muted/20 flex items-center justify-between rounded-lg border p-2.5 text-xs">
                      <span className="max-w-xs truncate font-semibold">{newVideoFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveNewVideo}
                        className="text-destructive h-7 text-xs"
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="hover:border-primary/50 bg-muted/10 text-muted-foreground flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-2.5 text-xs transition-colors">
                      <FileVideo className="text-primary h-4 w-4" />
                      <span>Choose replacement video file...</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Replace Thumbnail File */}
                <div>
                  <Label className="text-muted-foreground mb-1 block text-[11px]">
                    Upload New Thumbnail Image
                  </Label>
                  {newThumbnailFile ? (
                    <div className="bg-muted/20 flex items-center justify-between rounded-lg border p-2.5 text-xs">
                      <span className="max-w-xs truncate font-semibold">
                        {newThumbnailFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveNewThumbnail}
                        className="text-destructive h-7 text-xs"
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="hover:border-primary/50 bg-muted/10 text-muted-foreground flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-2.5 text-xs transition-colors">
                      <ImageIcon className="text-primary h-4 w-4" />
                      <span>Choose replacement thumbnail image...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
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
      </div>
    </div>
  );
}
