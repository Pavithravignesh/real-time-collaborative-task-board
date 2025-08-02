"use client";

import { Button } from "@/components/ui/button";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { TaskData } from "@/lib/types";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import Column from "./Column";
import TaskOverlay from "./TaskOverlay";

interface BoardContentProps {
  columns: ColumnWithTasks[];
  onCreateTask: (taskData: TaskData) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
  onMoveTask: (taskId: string, targetColumnId: string, newIndex: number) => Promise<void>;
  onSetColumns: (columns: ColumnWithTasks[]) => void;
  loading?: boolean;
}

export default function BoardContent({
  columns,
  onCreateTask,
  onEditColumn,
  onMoveTask,
  onSetColumns,
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
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );

    const targetColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overId)
    );

    if (!sourceColumn || !targetColumn) return;

    if (sourceColumn.id === targetColumn.id) {
      const activeIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === activeId
      );

      const overIndex = targetColumn.tasks.findIndex(
        (task) => task.id === overId
      );

              if (activeIndex !== overIndex) {
          const newColumns = [...columns];
          const column = newColumns.find((col) => col.id === sourceColumn.id);
          if (column) {
            const tasks = [...column.tasks];
            const [removed] = tasks.splice(activeIndex, 1);
            tasks.splice(overIndex, 0, removed);
            column.tasks = tasks;
          }
          onSetColumns(newColumns);
        }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn) {
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      if (sourceColumn && sourceColumn.id !== targetColumn.id) {
        await onMoveTask(taskId, targetColumn.id, targetColumn.tasks.length);
      }
    } else {
      // Check to see if were dropping on another task
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      const targetColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === overId)
      );

      if (sourceColumn && targetColumn) {
        const oldIndex = sourceColumn.tasks.findIndex(
          (task) => task.id === taskId
        );

        const newIndex = targetColumn.tasks.findIndex(
          (task) => task.id === overId
        );

        if (oldIndex !== newIndex) {
          await onMoveTask(taskId, targetColumn.id, newIndex);
        }
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto 
    lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2 
    lg:[&::-webkit-scrollbar-track]:bg-gray-100 
    lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full 
    space-y-4 lg:space-y-0"
      >
        {columns.map((column, key) => (
          <Column
            key={key}
            column={column}
            onCreateTask={onCreateTask}
            onEditColumn={onEditColumn}
          />
        ))}

        <div className="w-full lg:flex-shrink-0 lg:w-80">
          <Button
            variant="outline"
            className="w-full h-full min-h-[200px] border-dashed border-2 text-gray-500 hover:text-gray-700"
            disabled={loading}
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