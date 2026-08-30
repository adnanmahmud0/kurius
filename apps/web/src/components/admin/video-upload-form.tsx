"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Cloud, FileVideo, HardDrive, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { useCategories } from "@/hooks/use-categories";
import { useStorageSettings } from "@/hooks/use-storage-settings";
import { useUploadVideo } from "@/hooks/use-videos";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export function VideoUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: storageSetting } = useStorageSettings();

  const uploadVideoMutation = useUploadVideo((percent) => {
    setUploadProgress(percent);
  });

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video file is too large (Maximum 500MB)");
        return;
      }
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Thumbnail image is too large (Maximum 10MB)");
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error("Please choose a video file to upload");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    const formattedTags = hashtags
      .split(/[,\s]+/)
      .map((s) => s.trim().replace(/^#/, ""))
      .filter(Boolean);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subtitle", subtitle.trim());
    formData.append("categoryId", categoryId);
    formData.append("hashtags", JSON.stringify(formattedTags));
    formData.append("video", videoFile);
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    try {
      await uploadVideoMutation.mutateAsync(formData);
      router.push("/admin/videos");
    } catch {
      // Error handled in mutation
    }
  };

  const activeProvider = storageSetting?.provider || "local";

  return (
    <Card className="border-border/80 mx-auto max-w-3xl border">
      <CardHeader className="border-border/60 flex flex-col border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl font-bold">Upload Video</CardTitle>
          <CardDescription className="text-muted-foreground mt-0.5 text-xs">
            Add video title, category metadata, and files to publish to the platform
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className={`gap-1.5 px-3 py-1 text-xs font-semibold ${
            activeProvider === "cloudinary"
              ? "border-sky-500/30 bg-sky-500/5 text-sky-500"
              : "border-amber-500/30 bg-amber-500/5 text-amber-500"
          }`}
        >
          {activeProvider === "cloudinary" ? (
            <Cloud className="h-3.5 w-3.5" />
          ) : (
            <HardDrive className="h-3.5 w-3.5" />
          )}
          Target Storage: {activeProvider === "cloudinary" ? "Cloudinary CDN" : "Local Disk"}
        </Badge>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video File Picker */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-semibold uppercase">
              Video File (MP4, MKV, MOV, WebM · Max 500MB) *
            </Label>
            {videoFile && videoPreviewUrl ? (
              <div className="border-border bg-muted/20 space-y-3 rounded-xl border p-4 shadow-xs">
                <div className="relative aspect-video max-h-64 w-full overflow-hidden rounded-lg bg-black shadow-inner">
                  <video
                    src={videoPreviewUrl}
                    controls
                    playsInline
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-primary/10 text-primary rounded-md p-1.5">
                      <FileVideo className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-foreground max-w-xs truncate text-xs font-semibold sm:max-w-md">
                        {videoFile.name}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 text-xs"
                    onClick={handleRemoveVideo}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Change Video
                  </Button>
                </div>
              </div>
            ) : (
              <label className="border-border hover:border-primary/50 bg-muted/10 hover:bg-muted/20 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors">
                <div className="bg-primary/10 text-primary mb-3 rounded-full p-3 shadow-xs">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-foreground text-sm font-semibold">
                  Click to select video or drag & drop
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Supported formats: MP4, WebM, MOV, MKV up to 500MB
                </p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Thumbnail Image Picker */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-semibold uppercase">
              Thumbnail Cover Image (Optional · JPG, PNG, WebP)
            </Label>
            {thumbnailFile && thumbnailPreviewUrl ? (
              <div className="border-border bg-muted/20 flex items-center justify-between rounded-xl border p-3.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="border-border/80 h-20 w-32 shrink-0 overflow-hidden rounded-lg border bg-black shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-foreground max-w-xs truncate text-xs font-semibold sm:max-w-sm">
                      {thumbnailFile.name}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {(thumbnailFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 text-xs"
                  onClick={handleRemoveThumbnail}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            ) : (
              <label className="border-border hover:border-primary/50 bg-muted/10 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3.5 transition-colors">
                <ImageIcon className="text-muted-foreground ml-2 h-5 w-5" />
                <span className="text-muted-foreground text-xs font-medium">
                  Choose a custom thumbnail image (or leave empty)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Video Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g. NextJS 16 Tutorial"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subtitle" className="text-xs font-semibold">
                Subtitle / Short Summary (Optional)
              </Label>
              <Input
                id="subtitle"
                placeholder="e.g. Learn Turborepo and React Server Components"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </div>

          {/* Category & Hashtags */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingCategories ? "Loading categories..." : "Select a Category"
                    }
                  />
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
              <Label htmlFor="hashtags" className="text-xs font-semibold">
                Hashtags (Comma-separated)
              </Label>
              <Input
                id="hashtags"
                placeholder="tech, nextjs, react, tutorial"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
            </div>
          </div>

          {/* Progress Bar during Upload */}
          {uploadVideoMutation.isPending && (
            <div className="bg-primary/5 border-primary/20 space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-primary flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading video to {activeProvider}...
                </span>
                <span className="text-foreground">{uploadProgress}%</span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={uploadVideoMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                uploadVideoMutation.isPending ||
                !videoFile ||
                !title.trim() ||
                !subtitle.trim() ||
                !categoryId
              }
              className="gap-2 font-semibold"
            >
              {uploadVideoMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading ({uploadProgress}%)
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Publish Video
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
