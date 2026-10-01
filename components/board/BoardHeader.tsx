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
import { Board } from "@/lib/supabase/models";
import { useState, useEffect } from "react";

interface BoardHeaderProps {
  board: {
    id: string;
    title: string;
    color: string;
  } | null;
  onUpdateBoard: (boardId: string, data: Partial<{ title: string; color: string }>) => Promise<Board | undefined>;
  onEditBoard?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function BoardHeader({
  board,
  onUpdateBoard,
  isOpen,
  onOpenChange
}: BoardHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    if (!newTitle.trim() || !board) return;

    try {
      await onUpdateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });
      setIsEditingTitle(false);
    } catch { }
  }

  // Initialize form when dialog opens
  useEffect(() => {
    if (isEditingTitle && board) {
      setNewTitle(board.title);
      setNewColor(board.color);
    }
  }, [isEditingTitle, board]);

  const dialogOpen = isOpen !== undefined ? isOpen : isEditingTitle;
  const handleOpenChange = onOpenChange || setIsEditingTitle;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
        <DialogHeader>
          <DialogTitle>Edit Board</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleUpdateBoard}>
          <div className="space-y-2">
            <Label htmlFor="boardTitle">Board Title</Label>
            <Input
              id="boardTitle"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter board title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Board Color</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[
                "bg-blue-500",
                "bg-green-500",
                "bg-yellow-500",
                "bg-red-500",
                "bg-purple-500",
                "bg-pink-500",
                "bg-indigo-500",
                "bg-gray-500",
                "bg-orange-500",
                "bg-teal-500",
                "bg-cyan-500",
                "bg-emerald-500",
              ].map((color, key) => (
                <button
                  key={key}
                  type="button"
                  className={`w-8 h-8 rounded-full ${color} ${color === newColor
                      ? "ring-2 ring-offset-2 ring-gray-900"
                      : ""
                    } `}
                  onClick={() => setNewColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditingTitle(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 