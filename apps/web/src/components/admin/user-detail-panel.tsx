"use client";

import React from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Eye,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Video,
  XCircle
} from "lucide-react";

import { useAdminUserDetail } from "@/hooks/use-admin-users";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

interface UserDetailPanelProps {
  userId: string;
}

export function UserDetailPanel({ userId }: UserDetailPanelProps) {
  const { data: user, isLoading } = useAdminUserDetail(userId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center">
        <p className="text-foreground text-lg font-bold">User not found</p>
        <Link href="/admin/users" className="mt-4 inline-block">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  const statTiles = [
    {
      title: "Videos Created",
      value: user.stats?.videosCreated || 0,
      icon: Video,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Videos Viewed",
      value: user.stats?.viewsCount || 0,
      icon: Eye,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Likes Given",
      value: user.stats?.likesCount || 0,
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Comments Posted",
      value: user.stats?.commentsCount || 0,
      icon: MessageSquare,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="gap-2 text-xs font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Back to User Directory
          </Button>
        </Link>
        <Badge variant="outline" className="text-xs">
          User ID: <span className="ml-1 font-mono">{user.id}</span>
        </Badge>
      </div>

      {/* Main Profile Card */}
      <Card className="border-border/80 overflow-hidden border">
        <div className="from-primary/20 via-primary/10 to-accent/20 border-border/60 h-28 border-b bg-gradient-to-r" />
        <CardContent className="relative px-6 pt-0 pb-6">
          <div className="-mt-12 mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="border-card h-24 w-24 border-4 shadow-md">
                <AvatarImage src={user.avatar || undefined} alt={user.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {user.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-foreground text-xl font-bold">
                    {user.name || "Unnamed User"}
                  </h2>
                  <Badge
                    variant={user.role === "SUPER_ADMIN" ? "default" : "outline"}
                    className="text-[10px] font-bold uppercase"
                  >
                    {user.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user.verified ? (
                <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Account
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <XCircle className="h-3.5 w-3.5" />
                  Unverified
                </Badge>
              )}
            </div>
          </div>

          <div className="border-border text-muted-foreground grid gap-3 border-t pt-4 text-xs sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary h-4 w-4" />
              <span>
                Joined:{" "}
                <strong className="text-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="text-primary h-4 w-4" />
              <span>
                Status:{" "}
                <strong className="text-foreground uppercase">{user.status || "Active"}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-primary h-4 w-4" />
              <span>
                Location:{" "}
                <strong className="text-foreground">{user.location || "Not specified"}</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Stats Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Card key={tile.title} className="border-border/80 border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2.5 ${tile.bg} ${tile.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold uppercase">
                    {tile.title}
                  </p>
                  <p className="text-foreground mt-0.5 text-2xl font-bold">
                    {tile.value.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
