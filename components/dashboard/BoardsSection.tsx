"use client";

import { Button } from "@/components/ui/button";
import { Board } from "@/lib/supabase/models";
import { Filter, Plus } from "lucide-react";
import BoardGrid from "./BoardGrid";
import BoardList from "./BoardList";
import SearchBar from "./SearchBar";
import ViewToggle from "./ViewToggle";

interface BoardsSectionProps {
  boards: Board[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onCreateBoard: () => void;
}

export default function BoardsSection({
  boards,
  viewMode,
  onViewModeChange,
  searchValue,
  onSearchChange,
  onFilterClick,
  onCreateBoard,
}: BoardsSectionProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Your Boards
          </h2>
          <p className="text-gray-600">Manage your projects and tasks</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
          >
            <Filter />
            Filter
          </Button>

          <Button onClick={onCreateBoard}>
            <Plus />
            Create Board
          </Button>
        </div>
      </div>

      <SearchBar value={searchValue} onChange={onSearchChange} />

      {boards.length === 0 ? (
        <div>No boards yet</div>
      ) : viewMode === "grid" ? (
        <BoardGrid boards={boards} />
      ) : (
        <BoardList boards={boards} />
      )}
    </div>
  );
} 