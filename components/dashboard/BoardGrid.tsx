"use client";

import { Board } from "@/lib/supabase/models";
import BoardCard from "./BoardCard";

interface BoardGridProps {
  boards: Board[];
}

export default function BoardGrid({ boards }: BoardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {boards.map((board, key) => (
        <BoardCard board={board} key={key} />
      ))}
    </div>
  );
} 