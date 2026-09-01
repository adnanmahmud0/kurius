"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users as UsersIcon,
  UserX,
  XCircle
} from "lucide-react";

import type { IUser } from "@repo/types";

import { getMediaUrl } from "@/lib/utils";

import { useAdminUsers, useDeleteUser, useToggleUserStatus } from "@/hooks/use-admin-users";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export function UserTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);
  const [blockingUser, setBlockingUser] = useState<IUser | null>(null);

  const { data, isLoading } = useAdminUsers({
    page,
    limit: 10,
    searchTerm
  });

  const deleteUserMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();

  const users = (data?.data || []).filter((u) => u.role === "USER");
  const pagination = data?.pagination;

  const handleDelete = async () => {
    if (!deletingUser) return;
    await deleteUserMutation.mutateAsync(deletingUser.id);
    setDeletingUser(null);
  };

  const handleBlockToggle = async () => {
    if (!blockingUser) return;
    const nextStatus = blockingUser.status === "delete" ? "active" : "delete";
    await toggleStatusMutation.mutateAsync({ id: blockingUser.id, status: nextStatus });
    setBlockingUser(null);
  };

  const handleDirectUnblock = async (user: IUser) => {
    await toggleStatusMutation.mutateAsync({ id: user.id, status: "active" });
  };

  return (
    <Card className="border-border/80 border">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-bold">App Users</CardTitle>
          <CardDescription className="text-muted-foreground mt-0.5 text-xs">
            Monitor registered mobile app users, manage access status, and view engagement
          </CardDescription>
        </div>
        <div className="relative w-64">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="h-9 pl-8 text-xs"
          />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted text-muted-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <UsersIcon className="h-6 w-6" />
            </div>
            <p className="text-foreground text-sm font-semibold">No users found</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              No registered user accounts found matching your search.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">User</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead className="text-center">Activity (Views · Likes · Comments)</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isBlocked = user.status === "delete";

                  return (
                    <TableRow key={user.id} className={isBlocked ? "bg-destructive/5" : undefined}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="border-border h-9 w-9 border">
                            <AvatarImage
                              src={
                                user.avatar ? getMediaUrl(user.avatar, { width: 80 }) : undefined
                              }
                              alt={user.name || "User"}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {user.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col">
                            <span className="text-foreground max-w-[180px] truncate text-sm font-semibold">
                              {user.name || "Unnamed User"}
                            </span>
                            <span className="text-muted-foreground max-w-[180px] truncate text-xs">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          {isBlocked ? (
                            <Badge
                              variant="destructive"
                              className="gap-1 text-[10px] font-bold uppercase"
                            >
                              <Ban className="h-3 w-3" />
                              Blocked
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 uppercase dark:text-emerald-400"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          )}

                          <span className="text-muted-foreground text-[11px]">
                            {user.verified ? "Verified Email" : "Unverified"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span
                            className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 font-semibold text-amber-600 dark:text-amber-400"
                            title="Videos Watched"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {user.stats?.viewsCount || 0} Views
                          </span>
                          <span
                            className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-1 font-semibold text-rose-600 dark:text-rose-400"
                            title="Likes Given"
                          >
                            <Heart className="h-3.5 w-3.5" />
                            {user.stats?.likesCount || 0} Likes
                          </span>
                          <span
                            className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 font-semibold text-blue-600 dark:text-blue-400"
                            title="Comments Posted"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {user.stats?.commentsCount || 0} Comments
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Block / Unblock Button */}
                          {isBlocked ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Unblock User Account"
                              className="h-8 gap-1 text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                              onClick={() => handleDirectUnblock(user)}
                              disabled={toggleStatusMutation.isPending}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Block User Account"
                              className="h-8 w-8 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                              onClick={() => setBlockingUser(user)}
                              disabled={toggleStatusMutation.isPending}
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {/* Delete Permanently Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete User Permanently"
                            className="text-destructive hover:bg-destructive/10 h-8 w-8"
                            onClick={() => setDeletingUser(user)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>

                          {/* View Profile Link */}
                          <Link href={`/admin/users/${user.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-semibold"
                            >
                              Profile
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {pagination && pagination.totalPage > 1 && (
              <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-xs">
                  Showing page <span className="text-foreground font-bold">{pagination.page}</span>{" "}
                  of <span className="text-foreground font-bold">{pagination.totalPage}</span> (
                  {pagination.total} total users)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="h-8 gap-1 text-xs"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPage))}
                    disabled={page >= pagination.totalPage}
                    className="h-8 gap-1 text-xs"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Delete User Confirmation Modal */}
      <AlertDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete User Account Permanently
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete user &quot;
              {deletingUser?.name || "User"}&quot; ({deletingUser?.email})?
              <br />
              <br />
              This will permanently remove their account and erase all their watch history, likes,
              and comments. This action cannot be undone.
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

      {/* Block User Confirmation Modal */}
      <AlertDialog
        open={Boolean(blockingUser)}
        onOpenChange={(open) => !open && setBlockingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">
              {blockingUser?.status === "delete" ? "Unblock User Account" : "Block & Suspend User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockingUser?.status === "delete" ? (
                <>
                  Are you sure you want to unblock &quot;{blockingUser?.name}&quot; (
                  {blockingUser?.email})? They will regain full access to the app.
                </>
              ) : (
                <>
                  Are you sure you want to block &quot;{blockingUser?.name}&quot; (
                  {blockingUser?.email})? They will be immediately blocked from signing in or
                  interacting with videos.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockToggle}
              disabled={toggleStatusMutation.isPending}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {toggleStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {blockingUser?.status === "delete" ? "Confirm Unblock" : "Confirm Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
