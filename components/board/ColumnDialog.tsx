"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColumnDialogProps {
  isCreating: boolean;
  isEditing: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (title: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ColumnDialog({
  isCreating,
  isEditing,
  onOpenChange,
  title,
  onTitleChange,
  onSubmit,
  onCancel,
  loading = false,
}: ColumnDialogProps) {
  const isOpen = isCreating || isEditing;
  const dialogTitle = isCreating ? "Create New Column" : "Edit Column";
  const submitText = isCreating ? "Create Column" : "Edit Column";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <p className="text-sm text-gray-600">
            {isCreating
              ? "Add new column to organize your tasks"
              : "Update the title of your column"}
          </p>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Column Title</Label>
            <Input
              id="columnTitle"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter column title..."
              required
            />
          </div>
          <div className="space-x-2 flex justify-end">
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 