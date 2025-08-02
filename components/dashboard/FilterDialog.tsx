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
import { BoardFilterData } from "@/lib/types";

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: BoardFilterData;
  onFilterChange: (filters: BoardFilterData) => void;
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
          <DialogTitle>Filter Boards</DialogTitle>
          <p className="text-sm text-gray-600">
            Filter boards by title, date, or task count.
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              id="search"
              placeholder="Search board titles..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={filters.dateRange.start || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value || null,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={filters.dateRange.end || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        end: e.target.value || null,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Task Count</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Minimum</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Min tasks"
                  value={filters.taskCount.min || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      taskCount: {
                        ...filters.taskCount,
                        min: e.target.value ? Number(e.target.value) : null,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Maximum</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max tasks"
                  value={filters.taskCount.max || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      taskCount: {
                        ...filters.taskCount,
                        max: e.target.value ? Number(e.target.value) : null,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 