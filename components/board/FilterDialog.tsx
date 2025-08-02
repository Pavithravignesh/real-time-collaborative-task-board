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
import { FilterData } from "@/lib/types";

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterData;
  onFilterChange: (
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null
  ) => void;
  onClearFilters: () => void;
}

export default function FilterDialog({
  isOpen,
  onOpenChange,
  filters,
  onFilterChange,
  onClearFilters,
}: FilterDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
        <DialogHeader>
          <DialogTitle>Filter Tasks</DialogTitle>
          <p className="text-sm text-gray-600">
            Filter tasks by priority, assignee, or due date
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex flex-wrap gap-2">
              {["low", "medium", "high"].map((priority, key) => (
                <Button
                  onClick={() => {
                    const newPriorities = filters.priority.includes(priority)
                      ? filters.priority.filter((p) => p !== priority)
                      : [...filters.priority, priority];

                    onFilterChange("priority", newPriorities);
                  }}
                  key={key}
                  variant={
                    filters.priority.includes(priority) ? "default" : "outline"
                  }
                  size="sm"
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={filters.dueDate || ""}
              onChange={(e) =>
                onFilterChange("dueDate", e.target.value || null)
              }
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant={"outline"} onClick={onClearFilters}>
              Clear Filters
            </Button>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 