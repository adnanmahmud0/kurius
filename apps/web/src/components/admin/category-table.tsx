"use client";

import React, { useState } from "react";

import { Edit2, FolderPlus, Loader2, Plus, Search, Trash2 } from "lucide-react";

import type { ICategory } from "@repo/types";

import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory
} from "@/hooks/use-categories";

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

export function CategoryTable() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [editName, setEditName] = useState("");

  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(null);

  const { data, isLoading } = useAdminCategories({ search });
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await createCategoryMutation.mutateAsync({ name: newCategoryName.trim() });
    setNewCategoryName("");
    setIsAddOpen(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    await updateCategoryMutation.mutateAsync({
      id: editingCategory.id,
      payload: { name: editName.trim() }
    });
    setEditingCategory(null);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    await deleteCategoryMutation.mutateAsync(deletingCategory.id);
    setDeletingCategory(null);
  };

  const categories = data?.data || [];

  return (
    <Card className="border-border/80 border">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-bold">Category List</CardTitle>
          <CardDescription className="text-muted-foreground mt-0.5 text-xs">
            Organize video feeds into navigable topic categories
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted text-muted-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <FolderPlus className="h-6 w-6" />
            </div>
            <p className="text-foreground text-sm font-semibold">No categories found</p>
            <p className="text-muted-foreground mt-1 mb-4 max-w-sm text-xs">
              Get started by creating your first category to group videos.
            </p>
            <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Videos Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-foreground font-semibold">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    /{cat.slug}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-semibold">
                      {cat._count?.videos || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={cat.status === "active" ? "default" : "destructive"}
                      className="text-[10px] font-bold uppercase"
                    >
                      {cat.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingCategory(cat);
                          setEditName(cat.name);
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => setDeletingCategory(cat)}
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

      {/* Add Category Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Enter a category name. Slugs are automatically generated.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="category-name" className="text-xs font-semibold">
                Category Name
              </Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Gaming, Music, Technology"
                className="mt-1.5"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
              >
                {createCategoryMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update the name for this category.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="edit-name" className="text-xs font-semibold">
                Category Name
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1.5"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateCategoryMutation.isPending || !editName.trim()}>
                {updateCategoryMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate category &quot;{deletingCategory?.name}&quot;?
              Videos assigned to this category will remain, but the category won&apos;t appear in
              public feeds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteCategoryMutation.isPending}>
              {deleteCategoryMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
