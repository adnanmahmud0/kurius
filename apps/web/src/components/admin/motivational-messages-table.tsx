"use client";

import React, { useState } from "react";

import {
  Dices,
  Edit2,
  ListPlus,
  Loader2,
  Plus,
  Quote,
  RefreshCw,
  Search,
  Sparkles,
  Trash2
} from "lucide-react";

import type { IMotivationalMessage } from "@repo/types";

import {
  useAdminMotivationalMessages,
  useBulkCreateMotivationalMessages,
  useCreateMotivationalMessage,
  useDeleteMotivationalMessage,
  useRandomMotivationalMessage,
  useUpdateMotivationalMessage
} from "@/hooks/use-motivational-messages";

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
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";

export function MotivationalMessagesTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Single Add modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  // Bulk Add modal state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Edit modal state
  const [editingItem, setEditingItem] = useState<IMotivationalMessage | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editAuthor, setEditAuthor] = useState("");

  // Delete modal state
  const [deletingItem, setDeletingItem] = useState<IMotivationalMessage | null>(null);

  // Queries & Mutations
  const { data, isLoading } = useAdminMotivationalMessages({ page, limit: 15, search });
  const {
    data: randomQuote,
    refetch: refetchRandom,
    isFetching: isFetchingRandom
  } = useRandomMotivationalMessage();

  const createMutation = useCreateMotivationalMessage();
  const bulkCreateMutation = useBulkCreateMotivationalMessages();
  const updateMutation = useUpdateMotivationalMessage();
  const deleteMutation = useDeleteMotivationalMessage();

  const messages = data?.data || [];
  const pagination = data?.pagination;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await createMutation.mutateAsync({
      message: newMessage.trim(),
      author: newAuthor.trim() || null
    });
    setNewMessage("");
    setNewAuthor("");
    setIsAddOpen(false);
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    // Parse lines: each line can be "Quote text - Author" or just "Quote text"
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const parsedMessages = lines.map((line) => {
      if (line.includes(" - ")) {
        const parts = line.split(" - ");
        const author = parts.pop();
        const msg = parts
          .join(" - ")
          .replace(/^["']|["']$/g, "")
          .trim();
        return { message: msg, author: author?.trim() || null };
      }
      return { message: line.replace(/^["']|["']$/g, "").trim(), author: null };
    });

    if (parsedMessages.length === 0) return;

    await bulkCreateMutation.mutateAsync({ messages: parsedMessages });
    setBulkText("");
    setIsBulkOpen(false);
  };

  const handleOpenEdit = (item: IMotivationalMessage) => {
    setEditingItem(item);
    setEditMessage(item.message);
    setEditAuthor(item.author || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editMessage.trim()) return;
    await updateMutation.mutateAsync({
      id: editingItem.id,
      payload: {
        message: editMessage.trim(),
        author: editAuthor.trim() || null
      }
    });
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    await deleteMutation.mutateAsync(deletingItem.id);
    setDeletingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Live Random Quote Preview Widget */}
      <Card className="border-primary/20 bg-primary/5 border">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="bg-primary/10 text-primary mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-primary text-xs font-bold tracking-wider uppercase">
                  App Feed Preview · Random Quote API
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  GET /api/v1/motivational-messages/random
                </Badge>
              </div>
              <p className="text-foreground mt-1.5 text-sm font-semibold italic">
                &ldquo;{randomQuote?.message || "Believe you can and you're halfway there."}&rdquo;
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                — {randomQuote?.author || "Anonymous"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRandom()}
            disabled={isFetchingRandom}
            className="shrink-0 gap-1.5 text-xs font-semibold"
          >
            {isFetchingRandom ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Dices className="h-3.5 w-3.5" />
            )}
            Roll Next Quote
          </Button>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="border-border/80 border">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Motivational Quotes</CardTitle>
            <CardDescription className="text-muted-foreground mt-0.5 text-xs">
              Manage the pool of motivational messages randomly delivered to mobile app users
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative w-56 sm:w-64">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search quotes or authors..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-9 pl-8 text-xs"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkText("");
                setIsBulkOpen(true);
              }}
              className="gap-1.5 text-xs font-semibold"
            >
              <ListPlus className="h-4 w-4" />
              Bulk Add
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setNewMessage("");
                setNewAuthor("");
                setIsAddOpen(true);
              }}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add Quote
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted text-muted-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Quote className="h-6 w-6" />
              </div>
              <p className="text-foreground text-sm font-semibold">No motivational quotes found</p>
              <p className="text-muted-foreground mt-1 mb-4 max-w-sm text-xs">
                Add your first inspiring quotes for your mobile app users to see.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setNewMessage("");
                  setNewAuthor("");
                  setIsAddOpen(true);
                }}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-4 w-4" />
                Add Quote
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%]">Quote Message</TableHead>
                    <TableHead>Author / Attribution</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-foreground text-xs font-medium">
                        <span className="line-clamp-2 italic">&ldquo;{item.message}&rdquo;</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-semibold">
                        {item.author || "— Anonymous"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 h-8 w-8"
                            onClick={() => setDeletingItem(item)}
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

              {/* Pagination Controls */}
              {pagination && pagination.totalPage && pagination.totalPage > 1 && (
                <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-muted-foreground text-xs">
                    Showing page{" "}
                    <span className="text-foreground font-bold">{pagination.page}</span> of{" "}
                    <span className="text-foreground font-bold">{pagination.totalPage}</span> (
                    {pagination.total} total quotes)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page <= 1}
                      className="h-8 text-xs"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPage || 1))}
                      disabled={page >= (pagination.totalPage || 1)}
                      className="h-8 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Single Quote Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Motivational Quote</DialogTitle>
              <DialogDescription>
                Add a new quote to be shown to app users on random feed requests.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="quote-message" className="text-xs font-semibold">
                  Quote Text *
                </Label>
                <Textarea
                  id="quote-message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="e.g. Small steps in the right direction can turn out to be the biggest step of your life."
                  rows={3}
                  className="mt-1.5 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="quote-author" className="text-xs font-semibold">
                  Author / Speaker (Optional)
                </Label>
                <Input
                  id="quote-author"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Steve Jobs, Maya Angelou, Anonymous"
                  className="mt-1.5 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !newMessage.trim()}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Quote
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Quotes Modal */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleBulkCreate} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Bulk Add Motivational Quotes</DialogTitle>
              <DialogDescription>
                Paste multiple quotes (one quote per line). You can append &ldquo; - Author
                Name&rdquo; at the end of any line.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <Label htmlFor="bulk-quotes" className="text-xs font-semibold">
                Quotes (1 per line)
              </Label>
              <Textarea
                id="bulk-quotes"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`"Believe you can and you're halfway there." - Theodore Roosevelt
"The only limit to our realization of tomorrow will be our doubts of today." - Franklin D. Roosevelt
"Stay hungry, stay foolish." - Steve Jobs`}
                rows={8}
                className="font-mono text-xs"
                required
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsBulkOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={bulkCreateMutation.isPending || !bulkText.trim()}>
                {bulkCreateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import All Quotes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Quote Modal */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Motivational Quote</DialogTitle>
              <DialogDescription>Modify quote text or author attribution.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="edit-quote-message" className="text-xs font-semibold">
                  Quote Text *
                </Label>
                <Textarea
                  id="edit-quote-message"
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  rows={3}
                  className="mt-1.5 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="edit-quote-author" className="text-xs font-semibold">
                  Author / Speaker (Optional)
                </Label>
                <Input
                  id="edit-quote-author"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="mt-1.5 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending || !editMessage.trim()}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete Motivational Quote Permanently
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete quote &ldquo;
              {deletingItem?.message}&rdquo;? It will be removed from the random feed rotation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
