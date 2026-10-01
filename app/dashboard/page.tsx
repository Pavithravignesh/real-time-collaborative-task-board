"use client";

import Navbar from "@/components/navbar";
import { useBoards } from "@/lib/hooks/useBoards";
import { usePlan } from "@/lib/contexts/PlanContext";
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

const FREE_PLAN_BOARD_LIMIT = 1;

export default function DashboardPage() {
  const { createBoard, boards, loading, error } = useBoards();
  const { isFreeUser } = usePlan();
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
    if (isFreeUser && boards.length >= FREE_PLAN_BOARD_LIMIT) {
      setShowUpgradeDialog(true);
      return;
    }
    await createBoard({ title: "New Board" });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Error loading boards
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
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
          loading={loading}
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
