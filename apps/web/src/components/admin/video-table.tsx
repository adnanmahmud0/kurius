"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  Cloud,
  Edit,
  Eye,
  HardDrive,
  Heart,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Video as VideoIcon
} from "lucide-react";

import type { IVideo } from "@repo/types";

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
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export function VideoTable() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deletingVideo, setDeletingVideo] = useState<IVideo | null>(null);

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
            Manage, edit, and monitor all published and draft videos
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-48 sm:w-60">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9 w-36 text-xs sm:w-44">
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
            <Button size="sm" className="gap-1.5 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              Upload Video
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted text-muted-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <VideoIcon className="h-6 w-6" />
            </div>
            <p className="text-foreground text-sm font-semibold">No videos found</p>
            <p className="text-muted-foreground mt-1 mb-4 max-w-sm text-xs">
              Upload your first video to start building the catalog.
            </p>
            <Link href="/admin/videos/upload">
              <Button size="sm" className="gap-1.5 text-xs">
                <Plus className="h-4 w-4" />
                Upload Video
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow key={vid.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted border-border flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                        {vid.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <VideoIcon className="text-muted-foreground h-5 w-5" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-foreground max-w-[200px] truncate text-sm font-semibold">
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
                      <Link href={`/admin/videos/${vid.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
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
