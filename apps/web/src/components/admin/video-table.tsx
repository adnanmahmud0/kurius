"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  Cloud,
  Edit,
  ExternalLink,
  Eye,
  HardDrive,
  Heart,
  MessageSquare,
  Play,
  Plus,
  Search,
  Trash2,
  Video as VideoIcon
} from "lucide-react";

import type { IVideo } from "@repo/types";

import { getMediaUrl } from "@/lib/utils";

import { useCategories } from "@/hooks/use-categories";
import { useAdminVideos, useDeleteVideo } from "@/hooks/use-videos";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/ui/alert-dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export function VideoTable() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deletingVideo, setDeletingVideo] = useState<IVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<IVideo | null>(null);

  const { data: categories = [] } = useCategories();
  const { data, isLoading } = useAdminVideos({
    search,
    categoryId: selectedCategory === "all" ? undefined : selectedCategory
  });
  const deleteVideoMutation = useDeleteVideo();

  const videos = data?.data || [];

  const handleDelete = async () => {
    if (!deletingVideo) return;
    await deleteVideoMutation.mutateAsync(deletingVideo.id);
    setDeletingVideo(null);
  };

  return (
    <Card className="border-border/80 border">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-bold">Video Library</CardTitle>
          <CardDescription className="text-muted-foreground mt-0.5 text-xs">
            Manage, edit, play preview, and monitor all published and draft videos
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-48 sm:w-60">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="Search title, tags..."
              className="pl-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link href="/admin/videos/upload">
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Upload Video
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center p-12 text-center text-sm">
            <VideoIcon className="mb-3 h-10 w-10 opacity-30" />
            <p className="font-semibold">No videos found</p>
            <p className="text-xs">Try adjusting your search or upload a new video.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[320px]">Video</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead className="text-center">Engagement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((vid) => (
                <TableRow key={vid.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setPreviewVideo(vid)}
                        className="group bg-muted border-border relative flex h-14 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border shadow-xs"
                      >
                        {vid.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getMediaUrl(vid.thumbnailUrl)}
                            alt={vid.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <VideoIcon className="text-muted-foreground h-5 w-5" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-md">
                            <Play className="h-3.5 w-3.5 fill-current" />
                          </div>
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span
                          onClick={() => setPreviewVideo(vid)}
                          className="text-foreground hover:text-primary max-w-[200px] cursor-pointer truncate text-sm font-semibold transition-colors"
                        >
                          {vid.title}
                        </span>
                        <span className="text-muted-foreground max-w-[200px] truncate text-xs">
                          {vid.subtitle}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-medium">
                      {vid.category?.name || "Unassigned"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`gap-1 text-[11px] font-semibold ${
                        vid.storageType === "cloudinary"
                          ? "border-sky-500/30 bg-sky-500/5 text-sky-500"
                          : "border-amber-500/30 bg-amber-500/5 text-amber-500"
                      }`}
                    >
                      {vid.storageType === "cloudinary" ? (
                        <Cloud className="h-3 w-3" />
                      ) : (
                        <HardDrive className="h-3 w-3" />
                      )}
                      {vid.storageType === "cloudinary" ? "Cloudinary" : "Local Disk"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground flex items-center justify-center gap-3 text-xs font-medium">
                      <span className="flex items-center gap-1" title="Views">
                        <Eye className="h-3.5 w-3.5" />
                        {vid.stats?.viewsCount || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Likes">
                        <Heart className="h-3.5 w-3.5 text-rose-500" />
                        {vid.stats?.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Comments">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                        {vid.stats?.commentsCount || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={vid.status === "active" ? "default" : "destructive"}
                      className="text-[10px] font-bold uppercase"
                    >
                      {vid.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:bg-primary/10 h-8 w-8"
                        title="Play / Preview Video"
                        onClick={() => setPreviewVideo(vid)}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span className="sr-only">Play</span>
                      </Button>
                      <Link href={`/admin/videos/${vid.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Video">
                          <Edit className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        title="Deactivate Video"
                        onClick={() => setDeletingVideo(vid)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Video Play / Preview Dialog */}
      <Dialog open={Boolean(previewVideo)} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="border-border bg-card max-w-3xl p-6">
          {previewVideo && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {previewVideo.category?.name || "General"}
                  </Badge>
                  <Badge
                    variant={previewVideo.status === "active" ? "default" : "destructive"}
                    className="text-[10px] font-bold uppercase"
                  >
                    {previewVideo.status}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground text-[10px]">
                    {previewVideo.storageType === "cloudinary" ? "Cloudinary" : "Local Disk"}
                  </Badge>
                </div>
                <DialogTitle className="text-foreground mt-1 text-xl font-bold">
                  {previewVideo.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  {previewVideo.subtitle}
                </DialogDescription>
              </DialogHeader>

              {/* Video Player */}
              <div className="border-border/80 relative aspect-video w-full overflow-hidden rounded-xl border bg-black shadow-lg">
                <video
                  key={previewVideo.id}
                  src={getMediaUrl(previewVideo.videoUrl)}
                  poster={getMediaUrl(previewVideo.thumbnailUrl)}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Metadata Details & Hashtags */}
              <div className="border-border grid grid-cols-3 gap-2 border-y py-2 text-center">
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-muted-foreground text-[11px]">Views</p>
                  <p className="text-foreground text-sm font-bold">
                    {previewVideo.stats?.viewsCount || 0}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-muted-foreground text-[11px]">Likes</p>
                  <p className="text-sm font-bold text-rose-500">
                    {previewVideo.stats?.likesCount || 0}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-muted-foreground text-[11px]">Comments</p>
                  <p className="text-sm font-bold text-blue-500">
                    {previewVideo.stats?.commentsCount || 0}
                  </p>
                </div>
              </div>

              {previewVideo.hashtags && previewVideo.hashtags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground text-xs font-semibold">Hashtags:</span>
                  {previewVideo.hashtags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[11px] font-normal">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <DialogFooter className="flex items-center justify-between pt-2 sm:justify-between">
                <Link href={`/admin/videos/${previewVideo.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Edit className="h-3.5 w-3.5" />
                    Edit Video Metadata
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPreviewVideo(null)}
                  className="text-xs"
                >
                  Close Player
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingVideo)}
        onOpenChange={(open) => !open && setDeletingVideo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate &quot;{deletingVideo?.title}&quot;? It will no
              longer be visible in public or mobile feeds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteVideoMutation.isPending}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
