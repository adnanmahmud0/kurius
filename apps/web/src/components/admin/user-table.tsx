"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageSquare,
  Search,
  UserCheck,
  Users as UsersIcon,
  Video,
  XCircle
} from "lucide-react";

import { useAdminUsers } from "@/hooks/use-admin-users";

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

  const { data, isLoading } = useAdminUsers({
    page,
    limit: 10,
    searchTerm
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Card className="border-border/80 border">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-bold">User Directory</CardTitle>
          <CardDescription className="text-muted-foreground mt-0.5 text-xs">
            Monitor registered accounts, verification status, and platform engagement
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
              No matching user records found with current search filters.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-center">Engagement Stats</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="border-border h-9 w-9 border">
                          <AvatarImage src={user.avatar || undefined} alt={user.name || "User"} />
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
                      <Badge
                        variant={
                          user.role === "SUPER_ADMIN"
                            ? "default"
                            : user.role === "ADMIN"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px] font-bold uppercase"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <XCircle className="h-3.5 w-3.5" />
                          Unverified
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground flex items-center justify-center gap-3 text-xs font-medium">
                        <span className="flex items-center gap-1" title="Videos Created">
                          <Video className="h-3.5 w-3.5" />
                          {user.stats?.videosCreated || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="h-3.5 w-3.5 text-amber-500" />
                          {user.stats?.viewsCount || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Likes">
                          <Heart className="h-3.5 w-3.5 text-rose-500" />
                          {user.stats?.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Comments">
                          <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                          {user.stats?.commentsCount || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                          View Profile
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
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
    </Card>
  );
}
