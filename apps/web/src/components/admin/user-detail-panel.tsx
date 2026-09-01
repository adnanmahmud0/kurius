"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Ban,
  Calendar,
  CheckCircle2,
  Eye,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Trash2,
  UserCheck
} from "lucide-react";

import { getMediaUrl } from "@/lib/utils";

import { useAdminUserDetail, useDeleteUser, useToggleUserStatus } from "@/hooks/use-admin-users";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

interface UserDetailPanelProps {
  userId: string;
}

export function UserDetailPanel({ userId }: UserDetailPanelProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const { data: user, isLoading } = useAdminUserDetail(userId);
  const deleteUserMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
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

  const isBlocked = user.status === "delete";

  const handleDelete = async () => {
    await deleteUserMutation.mutateAsync(user.id);
    setIsDeleting(false);
    router.push("/admin/users");
  };

  const handleToggleBlock = async () => {
    const nextStatus = isBlocked ? "active" : "delete";
    await toggleStatusMutation.mutateAsync({ id: user.id, status: nextStatus });
    setIsBlocking(false);
  };

  const statTiles = [
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="gap-2 text-xs font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Back to User Directory
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {isBlocked ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-emerald-500/30 text-xs text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => setIsBlocking(true)}
              disabled={toggleStatusMutation.isPending}
            >
              <UserCheck className="h-4 w-4" />
              Unblock Account
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-500/30 text-xs text-amber-600 hover:bg-amber-500/10"
              onClick={() => setIsBlocking(true)}
              disabled={toggleStatusMutation.isPending}
            >
              <Ban className="h-4 w-4" />
              Block / Suspend User
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setIsDeleting(true)}
            disabled={deleteUserMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            Delete Permanently
          </Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="border-border/80 overflow-hidden border">
        <div className="bg-muted/40 border-border flex flex-col items-center gap-4 border-b p-6 sm:flex-row sm:items-start sm:gap-6">
          <Avatar className="border-border h-20 w-20 border shadow-sm">
            <AvatarImage
              src={user.avatar ? getMediaUrl(user.avatar, { width: 160 }) : undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {user.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <h2 className="text-foreground text-xl font-bold">{user.name || "Unnamed User"}</h2>
              <div className="flex items-center gap-2">
                {isBlocked ? (
                  <Badge variant="destructive" className="gap-1 text-xs font-bold uppercase">
                    <Ban className="h-3 w-3" />
                    Blocked
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-600 uppercase dark:text-emerald-400"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Active Account
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">{user.email}</p>

            <div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-4 text-xs sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Auth: <span className="capitalize">{user.provider || "Email"}</span>
              </span>
              {user.contact && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {user.contact}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional metadata row */}
        <CardContent className="bg-card/50 p-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
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
      <div className="grid gap-4 sm:grid-cols-3">
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

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete User Account Permanently
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete user &quot;{user.name || "User"}&quot; (
              {user.email})?
              <br />
              <br />
              This will permanently erase their account and all associated views, likes, and
              comments from the platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block / Suspend Alert Dialog */}
      <AlertDialog open={isBlocking} onOpenChange={setIsBlocking}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">
              {isBlocked ? "Unblock User Account" : "Block & Suspend User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBlocked ? (
                <>
                  Are you sure you want to unblock &quot;{user.name}&quot; ({user.email})? They will
                  regain full access to the app.
                </>
              ) : (
                <>
                  Are you sure you want to block &quot;{user.name}&quot; ({user.email})? They will
                  be immediately suspended from signing in or interacting on the app.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleBlock}
              disabled={toggleStatusMutation.isPending}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {toggleStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isBlocked ? "Confirm Unblock" : "Confirm Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
