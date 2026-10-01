"use client";

import { Button } from "@/components/ui/button";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import Column, { columnDroppableId } from "./Column";
import TaskOverlay from "./TaskOverlay";

interface BoardContentProps {
  columns: ColumnWithTasks[];
  onEditColumn: (column: ColumnWithTasks) => void;
  onMoveTask: (
    taskId: string,
    targetColumnId: string,
    overTaskId: string | null
  ) => Promise<void>;
  onAddColumn: () => void;
  loading?: boolean;
}

export default function BoardContent({
  columns,
  onEditColumn,
  onMoveTask,
  onAddColumn,
  loading = false,
}: BoardContentProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id as string;

    // Dropped on a column's empty space: append to that column
    const droppedOnColumn = columns.find(
      (col) => columnDroppableId(col.id) === over.id
    );
    if (droppedOnColumn) {
      await onMoveTask(taskId, droppedOnColumn.id, null);
      return;
    }

    // Dropped on another task: take its position
    const overTaskId = over.id as string;
    const targetColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overTaskId)
    );
    if (targetColumn) {
      await onMoveTask(taskId, targetColumn.id, overTaskId);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div
        className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto
    lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2
    lg:[&::-webkit-scrollbar-track]:bg-gray-100
    lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full
    space-y-4 lg:space-y-0"
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onEditColumn={onEditColumn}
          />
        ))}

        <div className="w-full lg:flex-shrink-0 lg:w-80">
          <Button
            variant="outline"
            className="w-full h-full min-h-[200px] border-dashed border-2 text-gray-500 hover:text-gray-700"
            disabled={loading}
            onClick={onAddColumn}
          >
            <Plus />
            {loading ? "Loading..." : "Add another list"}
          </Button>
        </div>

        <DragOverlay>
          {activeTask ? <TaskOverlay task={activeTask} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
