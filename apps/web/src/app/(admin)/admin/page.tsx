"use client";

import React from "react";
import Link from "next/link";

import { FolderTree, Plus, Sparkles, Upload, Users, Video } from "lucide-react";

import { useAdminUsers } from "@/hooks/use-admin-users";
import { useCategories } from "@/hooks/use-categories";
import { useAdminVideos } from "@/hooks/use-videos";

import { ChartAreaInteractive } from "@/components/admin/chart-area-interactive";
import { SectionCards } from "@/components/admin/section-cards";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";

export default function AdminDashboardPage() {
  const { data: usersData, isLoading: isLoadingUsers } = useAdminUsers({ limit: 100 });
  const { data: videosData, isLoading: isLoadingVideos } = useAdminVideos({ limit: 100 });
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  const totalUsers = usersData?.pagination?.total ?? (usersData?.data?.length || 0);
  const totalVideos = videosData?.meta?.total ?? (videosData?.data?.length || 0);

  // Sum up live views and likes across loaded videos
  const videos = videosData?.data || [];
  const totalViews = videos.reduce((acc, v) => acc + (v.stats?.viewsCount || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.stats?.likesCount || 0), 0);

  const isLoading = isLoadingUsers || isLoadingVideos;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome Banner */}
      <div className="from-primary/15 via-primary/5 to-accent/10 border-primary/20 flex flex-col gap-4 rounded-2xl border bg-gradient-to-r p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-foreground text-2xl font-extrabold tracking-tight">
              Admin Overview
            </h2>
            <Badge className="bg-primary text-primary-foreground gap-1 text-[11px] font-bold">
              <Sparkles className="h-3 w-3" /> Live
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-lg text-xs">
            Welcome to the Kurius content operations console. Upload videos, organize categories,
            and monitor platform growth in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/videos/upload">
            <Button size="sm" className="gap-2 font-semibold shadow-xs">
              <Upload className="h-4 w-4" />
              Upload Video
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant="outline" size="sm" className="gap-2 font-semibold">
              <FolderTree className="h-4 w-4" />
              Manage Categories
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Stat Cards */}
      <SectionCards
        totalUsers={totalUsers}
        totalVideos={totalVideos}
        totalViews={totalViews}
        totalLikes={totalLikes}
        isLoading={isLoading}
      />

      {/* Interactive Activity Chart */}
      <ChartAreaInteractive />

      {/* Two Column Summary Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Categories Preview */}
        <Card className="border-border/80 border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <FolderTree className="text-primary h-4 w-4" />
                Active Categories
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-0.5 text-xs">
                {categories.length} categories available for video tagging
              </CardDescription>
            </div>
            <Link href="/admin/categories">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <p className="text-muted-foreground text-xs">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-xs">
                No categories created yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.slice(0, 8).map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="outline"
                    className="hover:bg-accent gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="text-muted-foreground text-[10px] font-normal">
                      ({cat._count?.videos || 0})
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links & Shortcuts */}
        <Card className="border-border/80 border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Sparkles className="text-primary h-4 w-4" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-0.5 text-xs">
              Direct access to common administrative operations
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <Link href="/admin/videos/upload">
              <div className="border-border hover:border-primary/40 hover:bg-accent/50 cursor-pointer rounded-lg border p-3 transition-all">
                <Upload className="text-primary mb-1.5 h-5 w-5" />
                <p className="text-foreground text-xs font-bold">Upload Video</p>
                <p className="text-muted-foreground text-[11px]">Add new MP4/MOV file</p>
              </div>
            </Link>
            <Link href="/admin/categories">
              <div className="border-border hover:border-primary/40 hover:bg-accent/50 cursor-pointer rounded-lg border p-3 transition-all">
                <FolderTree className="text-primary mb-1.5 h-5 w-5" />
                <p className="text-foreground text-xs font-bold">New Category</p>
                <p className="text-muted-foreground text-[11px]">Create content group</p>
              </div>
            </Link>
            <Link href="/admin/users">
              <div className="border-border hover:border-primary/40 hover:bg-accent/50 cursor-pointer rounded-lg border p-3 transition-all">
                <Users className="text-primary mb-1.5 h-5 w-5" />
                <p className="text-foreground text-xs font-bold">Audit Users</p>
                <p className="text-muted-foreground text-[11px]">Review accounts &amp; metrics</p>
              </div>
            </Link>
            <Link href="/admin/settings/storage">
              <div className="border-border hover:border-primary/40 hover:bg-accent/50 cursor-pointer rounded-lg border p-3 transition-all">
                <Video className="text-primary mb-1.5 h-5 w-5" />
                <p className="text-foreground text-xs font-bold">Storage Provider</p>
                <p className="text-muted-foreground text-[11px]">Local or Cloudinary</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
