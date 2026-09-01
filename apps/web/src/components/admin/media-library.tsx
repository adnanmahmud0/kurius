"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import {
  Check,
  Clapperboard,
  Cloud,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  Film,
  Grid3X3,
  HardDrive,
  ImageIcon,
  List,
  Play,
  Plus,
  Search
} from "lucide-react";
import { toast } from "sonner";

import type { IVideo } from "@repo/types";

import { getMediaUrl, getVideoThumbnail } from "@/lib/utils";

import { useStorageSettings } from "@/hooks/use-storage-settings";
import { useAdminVideos } from "@/hooks/use-videos";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";

interface MediaAsset {
  id: string;
  type: "video" | "image";
  url: string;
  filename: string;
  title: string;
  categoryName?: string;
  storageType: string;
  publicId?: string | null;
  createdAt: string;
  videoRecord: IVideo;
}

export function MediaLibrary() {
  const [search, setSearch] = useState("");
  const [mediaType, setMediaType] = useState<"all" | "video" | "image">("all");
  const [storageFilter, setStorageFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { data, isLoading } = useAdminVideos({ limit: 100 });
  const { data: storageSetting } = useStorageSettings();

  const videos = data?.data || [];

  // Flatten video items into distinct media assets (video stream files + thumbnail images)
  const allAssets: MediaAsset[] = useMemo(() => {
    const assets: MediaAsset[] = [];

    videos.forEach((vid) => {
      // 1. Video Asset
      if (vid.videoUrl) {
        const videoFilename =
          vid.videoUrl.split("/").pop() || `${vid.title.toLowerCase().replace(/\s+/g, "-")}.mp4`;
        assets.push({
          id: `${vid.id}-video`,
          type: "video",
          url: vid.videoUrl,
          filename: videoFilename,
          title: vid.title,
          categoryName: vid.category?.name,
          storageType: vid.storageType || "local",
          publicId: vid.publicId,
          createdAt: String(vid.createdAt),
          videoRecord: vid
        });
      }

      // 2. Thumbnail Asset (if available)
      if (vid.thumbnailUrl) {
        const thumbFilename =
          vid.thumbnailUrl.split("/").pop() ||
          `${vid.title.toLowerCase().replace(/\s+/g, "-")}-cover.jpg`;
        assets.push({
          id: `${vid.id}-thumb`,
          type: "image",
          url: vid.thumbnailUrl,
          filename: thumbFilename,
          title: `${vid.title} (Thumbnail)`,
          categoryName: vid.category?.name,
          storageType: vid.storageType || "local",
          publicId: vid.publicId ? `${vid.publicId}-thumb` : null,
          createdAt: String(vid.createdAt),
          videoRecord: vid
        });
      }
    });

    return assets;
  }, [videos]);

  // Filter assets by search, type, and storage provider
  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => {
      // Filter by type
      if (mediaType !== "all" && asset.type !== mediaType) return false;

      // Filter by storage
      if (storageFilter !== "all" && asset.storageType !== storageFilter) return false;

      // Filter by search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = asset.title.toLowerCase().includes(q);
        const matchesFile = asset.filename.toLowerCase().includes(q);
        const matchesCat = asset.categoryName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesFile && !matchesCat) return false;
      }

      return true;
    });
  }, [allAssets, mediaType, storageFilter, search]);

  const handleCopyUrl = (url: string) => {
    const fullUrl = getMediaUrl(url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    toast.success("Public Media URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const videoCount = allAssets.filter((a) => a.type === "video").length;
  const imageCount = allAssets.filter((a) => a.type === "image").length;
  const activeProvider = storageSetting?.provider || "local";

  return (
    <div className="space-y-6">
      {/* Header & Metric Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground text-xs">
            Browse, preview, and manage all uploaded video streams and thumbnail assets
          </p>
        </div>

        <Link href="/admin/videos/upload">
          <Button size="sm" className="gap-2 text-xs font-semibold">
            <Plus className="h-4 w-4" />
            Upload New Media
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-border/80 border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold">Total Assets</p>
            <Film className="text-primary h-4 w-4" />
          </div>
          <p className="text-foreground mt-1 text-2xl font-bold">{allAssets.length}</p>
          <p className="text-muted-foreground mt-0.5 text-[10px]">Videos + Thumbnails</p>
        </Card>

        <Card className="border-border/80 border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold">Video Files</p>
            <Clapperboard className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-foreground mt-1 text-2xl font-bold">{videoCount}</p>
          <p className="text-muted-foreground mt-0.5 text-[10px]">MP4 / WebM Streams</p>
        </Card>

        <Card className="border-border/80 border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold">Covers & Images</p>
            <ImageIcon className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-foreground mt-1 text-2xl font-bold">{imageCount}</p>
          <p className="text-muted-foreground mt-0.5 text-[10px]">JPG / PNG / WebP</p>
        </Card>

        <Card className="border-border/80 border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold">Active Storage</p>
            {activeProvider === "cloudinary" ? (
              <Cloud className="h-4 w-4 text-sky-500" />
            ) : (
              <HardDrive className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <p className="text-foreground mt-2 text-sm font-bold capitalize">
            {activeProvider === "cloudinary" ? "Cloudinary CDN" : "Local Server Disk"}
          </p>
          <p className="text-muted-foreground mt-0.5 text-[10px]">Target upload provider</p>
        </Card>
      </div>

      {/* Control Bar (Search, Type Tabs, Storage Filter, View Mode) */}
      <Card className="border-border/80 border p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Type Tabs & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={mediaType}
              onValueChange={(val) => setMediaType(val as "all" | "video" | "image")}
            >
              <TabsList className="h-9">
                <TabsTrigger value="all" className="gap-1.5 text-xs">
                  All ({allAssets.length})
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-1.5 text-xs">
                  <Film className="h-3.5 w-3.5" />
                  Videos ({videoCount})
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-1.5 text-xs">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Images ({imageCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-48 sm:w-64">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search file or title..."
                className="h-9 pl-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Right: Storage Filter & View Toggler */}
          <div className="flex items-center gap-3">
            <Select value={storageFilter} onValueChange={setStorageFilter}>
              <SelectTrigger className="h-9 w-36 text-xs">
                <SelectValue placeholder="All Storage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Storage</SelectItem>
                <SelectItem value="local">Local Disk</SelectItem>
                <SelectItem value="cloudinary">Cloudinary</SelectItem>
              </SelectContent>
            </Select>

            <div className="bg-muted border-border flex items-center rounded-lg border p-0.5">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Asset Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-xl" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card className="border-border/80 flex flex-col items-center justify-center border p-12 text-center">
          <Film className="text-muted-foreground mb-3 h-10 w-10 opacity-30" />
          <p className="text-foreground text-sm font-semibold">No media assets found</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Try adjusting your search or upload your first video.
          </p>
          <Link href="/admin/videos/upload" className="mt-4">
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Upload Video
            </Button>
          </Link>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="border-border/80 group hover:border-primary/40 overflow-hidden border transition-all duration-200 hover:shadow-md"
            >
              {/* Media Thumbnail / Video Box */}
              <div
                onClick={() => setSelectedAsset(asset)}
                className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black"
              >
                {asset.type === "video" ? (
                  <>
                    {asset.videoRecord.thumbnailUrl || getVideoThumbnail(asset.url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getVideoThumbnail(asset.url, asset.videoRecord.thumbnailUrl)}
                        alt={asset.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-black/80">
                        <Film className="text-muted-foreground/40 h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-70 transition-opacity group-hover:opacity-100">
                      <div className="bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg">
                        <Play className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getMediaUrl(asset.url, { width: 500 })}
                      alt={asset.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-white/90 p-2.5 text-black shadow-lg">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>
                  </>
                )}

                {/* Badges on top of card */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className="bg-black/70 text-[10px] font-bold text-white uppercase backdrop-blur-xs"
                  >
                    {asset.type}
                  </Badge>
                </div>

                <div className="absolute top-2 right-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold backdrop-blur-xs ${
                      asset.storageType === "cloudinary"
                        ? "border-sky-500/50 bg-sky-950/80 text-sky-300"
                        : "border-amber-500/50 bg-amber-950/80 text-amber-300"
                    }`}
                  >
                    {asset.storageType === "cloudinary" ? "Cloudinary" : "Local Disk"}
                  </Badge>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <CardContent className="space-y-2 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p
                      onClick={() => setSelectedAsset(asset)}
                      className="text-foreground hover:text-primary cursor-pointer truncate text-xs font-bold transition-colors"
                      title={asset.title}
                    >
                      {asset.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 truncate font-mono text-[11px]">
                      {asset.filename}
                    </p>
                  </div>
                </div>

                <div className="border-border/60 flex items-center justify-between border-t pt-2 text-[11px]">
                  <span className="text-muted-foreground max-w-[120px] truncate">
                    {asset.categoryName || "General"}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-7 w-7"
                      title="Copy Public URL"
                      onClick={() => handleCopyUrl(asset.url)}
                    >
                      {copiedUrl === asset.url ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <a
                      href={getMediaUrl(asset.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-7 w-7"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>

                    <Link href={`/admin/videos/${asset.videoRecord.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-7 w-7"
                        title="Edit Video"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table Asset View */
        <Card className="border-border/80 border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[80px]">Preview</TableHead>
                <TableHead>File Name & Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div
                      onClick={() => setSelectedAsset(asset)}
                      className="bg-muted border-border relative h-12 w-16 cursor-pointer overflow-hidden rounded-md border"
                    >
                      {asset.type === "video" ? (
                        asset.videoRecord.thumbnailUrl || getVideoThumbnail(asset.url) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getVideoThumbnail(asset.url, asset.videoRecord.thumbnailUrl)}
                            alt={asset.title}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-black/80">
                            <Play className="text-primary h-4 w-4" />
                          </div>
                        )
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getMediaUrl(asset.url, { width: 160 })}
                          alt={asset.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span
                        onClick={() => setSelectedAsset(asset)}
                        className="text-foreground hover:text-primary cursor-pointer text-xs font-bold transition-colors"
                      >
                        {asset.title}
                      </span>
                      <span className="text-muted-foreground max-w-xs truncate font-mono text-[10px]">
                        {asset.filename}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase">
                      {asset.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${
                        asset.storageType === "cloudinary"
                          ? "border-sky-500/30 text-sky-500"
                          : "border-amber-500/30 text-amber-500"
                      }`}
                    >
                      {asset.storageType === "cloudinary" ? "Cloudinary" : "Local Disk"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-xs">
                      {asset.categoryName || "General"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Preview"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Copy Public URL"
                        onClick={() => handleCopyUrl(asset.url)}
                      >
                        {copiedUrl === asset.url ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <a href={getMediaUrl(asset.url)} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Media Detail & Playback Preview Modal */}
      <Dialog
        open={Boolean(selectedAsset)}
        onOpenChange={(open) => !open && setSelectedAsset(null)}
      >
        <DialogContent className="border-border bg-card max-w-3xl p-6">
          {selectedAsset && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-bold uppercase">
                    {selectedAsset.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedAsset.categoryName || "General"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      selectedAsset.storageType === "cloudinary"
                        ? "border-sky-500/30 text-sky-500"
                        : "border-amber-500/30 text-amber-500"
                    }`}
                  >
                    {selectedAsset.storageType === "cloudinary" ? "Cloudinary CDN" : "Local Disk"}
                  </Badge>
                </div>
                <DialogTitle className="text-foreground mt-1 text-lg font-bold">
                  {selectedAsset.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground truncate font-mono text-xs">
                  {selectedAsset.filename}
                </DialogDescription>
              </DialogHeader>

              {/* Media Viewport */}
              <div className="border-border relative aspect-video w-full overflow-hidden rounded-xl border bg-black shadow-lg">
                {selectedAsset.type === "video" ? (
                  <video
                    key={selectedAsset.id}
                    src={getMediaUrl(selectedAsset.url)}
                    poster={getVideoThumbnail(
                      selectedAsset.url,
                      selectedAsset.videoRecord.thumbnailUrl
                    )}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getMediaUrl(selectedAsset.url, { width: 1200 })}
                    alt={selectedAsset.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              {/* Public URL Box */}
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-xs font-semibold">Public Media URL</p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={getMediaUrl(selectedAsset.url)}
                    className="bg-muted/30 h-9 font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0 gap-1.5 text-xs"
                    onClick={() => handleCopyUrl(selectedAsset.url)}
                  >
                    {copiedUrl === selectedAsset.url ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between pt-2 sm:justify-between">
                <Link href={`/admin/videos/${selectedAsset.videoRecord.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Edit className="h-3.5 w-3.5" />
                    Edit Associated Video
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAsset(null)}
                  className="text-xs"
                >
                  Close Viewer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
