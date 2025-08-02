"use client";

import Navbar from "@/components/navbar";
import { useBoards } from "@/lib/hooks/useBoards";
import { Board } from "@/lib/supabase/models";
import { BoardFilterData } from "@/lib/types";
import { useState } from "react";
import {
  DashboardHeader,
  DashboardStats,
  BoardsSection,
  FilterDialog,
  UpgradeDialog,
} from "@/components/dashboard";

export default function DashboardPage() {
  const { createBoard, boards, error } = useBoards();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);

  const [filters, setFilters] = useState<BoardFilterData>({
    search: "",
    dateRange: {
      start: null,
      end: null,
    },
    taskCount: {
      min: null,
      max: null,
    },
  });

  const boardsWithTaskCount = boards.map((board: Board) => ({
    ...board,
    taskCount: 0, // This would need to be calculated from actual data
  }));

  const filteredBoards = boardsWithTaskCount.filter((board: Board) => {
    const matchesSearch = board.title
      .toLowerCase()
      .includes(filters.search.toLowerCase());

    const matchesDateRange =
      (!filters.dateRange.start ||
        new Date(board.created_at) >= new Date(filters.dateRange.start)) &&
      (!filters.dateRange.end ||
        new Date(board.created_at) <= new Date(filters.dateRange.end));

    return matchesSearch && matchesDateRange;
  });

  function clearFilters() {
    setFilters({
      search: "",
      dateRange: {
        start: null,
        end: null,
      },
      taskCount: {
        min: null,
        max: null,
      },
    });
  }

  const handleCreateBoard = async () => {
    await createBoard({ title: "New Board" });
  };

  if (error) {
    return (
      <div>
        <h2> Error loading boards</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <DashboardHeader />
        <DashboardStats boards={boards} />
        
        <BoardsSection
          boards={filteredBoards}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchValue={filters.search}
          onSearchChange={(value) =>
            setFilters((prev) => ({ ...prev, search: value }))
          }
          onFilterClick={() => setIsFilterOpen(true)}
          onCreateBoard={handleCreateBoard}
        />
      </main>

      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
      />

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />
    </div>
  );
}
