"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnWithTasks } from "@/lib/supabase/models";
import { MoreHorizontal } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

// Columns and tasks share one dnd-kit id space, and both use numeric DB ids,
// so column droppables are prefixed to avoid colliding with task ids.
export const columnDroppableId = (columnId: string) => `column-${columnId}`;

interface ColumnProps {
  column: ColumnWithTasks;
  onEditColumn: (column: ColumnWithTasks) => void;
}

export default function Column({ column, onEditColumn }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnDroppableId(column.id),
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full lg:flex-shrink-0 lg:w-80 ${
        isOver ? "bg-blue-50 rounded-lg" : ""
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-sm border ${
          isOver ? "ring-2 ring-blue-300" : ""
        }`}
      >
        {/* Column Header */}
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {column.title}
              </h3>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {column.tasks.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => onEditColumn(column)}
            >
              <MoreHorizontal />
            </Button>
          </div>
        </div>

        {/* column content */}
        <div className="p-2 min-h-[80px]">
          <SortableContext
            items={column.tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <TaskCard task={task} key={task.id} />
              ))}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
