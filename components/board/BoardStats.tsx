"use client";

import { ColumnWithTasks } from "@/lib/supabase/models";
import TaskDialog from "./TaskDialog";

interface BoardStatsProps {
  columns: ColumnWithTasks[];
  onCreateTask: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function BoardStats({ columns, onCreateTask }: BoardStatsProps) {
  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Total Tasks: </span>
          {totalTasks}
        </div>
      </div>

      <TaskDialog onSubmit={onCreateTask} />
    </div>
  );
} 