"use client";

import Navbar from "@/components/navbar";
import { useBoard } from "@/lib/hooks/useBoards";
import { ColumnWithTasks } from "@/lib/supabase/models";
import { TaskData } from "@/lib/types";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  BoardHeader,
  BoardStats,
  BoardContent,
  ColumnDialog,
  FilterDialog,
} from "@/components/board";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    board,
    createColumn,
    updateBoard,
    columns,
    createRealTask,
    moveTask,
    updateColumn,
    loading,
    error,
  } = useBoard(id);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
    null
  );

  const [filters, setFilters] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  const [isEditingBoard, setIsEditingBoard] = useState(false);

  function handleFilterChange(
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null
  ) {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      priority: [] as string[],
      assignee: [] as string[],
      dueDate: null as string | null,
    });
  }

  async function createTask(taskData: TaskData) {
    const targetColumn = columns[0];
    if (!targetColumn) {
      throw new Error("No column available to add task");
    }

    await createRealTask(targetColumn.id, taskData);
  }

  async function handleCreateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!newColumnTitle.trim()) return;

    if (loading) return;

    try {
      await createColumn(newColumnTitle.trim());
      setNewColumnTitle("");
      setIsCreatingColumn(false);
    } catch (error) {
      console.error("Failed to create column:", error);
    }
  }

  async function handleUpdateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!editingColumnTitle.trim() || !editingColumn) return;

    await updateColumn(editingColumn.id, editingColumnTitle.trim());

    setEditingColumnTitle("");
    setIsEditingColumn(false);
    setEditingColumn(null);
  }

  function handleEditColumn(column: ColumnWithTasks) {
    setIsEditingColumn(true);
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  }

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      // Filter by priority
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }

      // Filter by due date (both are YYYY-MM-DD strings)
      if (filters.dueDate && task.due_date !== filters.dueDate) {
        return false;
      }

      return true;
    }),
  }));

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          boardTitle={board?.title}
          onEditBoard={() => setIsEditingBoard(true)}
          onFilterClick={() => setIsFilterOpen(true)}
          filterCount={Object.values(filters).reduce(
            (count, v) =>
              count + (Array.isArray(v) ? v.length : v !== null ? 1 : 0),
            0
          )}
        />

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading board...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-600">Error: {error}</p>
            </div>
          </div>
        )}

        {/* Board Content */}
        {!loading && !error && (
          <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
            <BoardStats
              columns={columns}
              onCreateTask={createTask}
              disabled={columns.length === 0}
            />

            <BoardContent
              columns={filteredColumns}
              onEditColumn={handleEditColumn}
              onMoveTask={moveTask}
              onAddColumn={() => setIsCreatingColumn(true)}
              loading={loading}
            />
          </main>
        )}
      </div>

      <BoardHeader 
        board={board} 
        onUpdateBoard={updateBoard}
        onEditBoard={() => setIsEditingBoard(true)}
        isOpen={isEditingBoard}
        onOpenChange={setIsEditingBoard}
      />

      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <ColumnDialog
        isCreating={isCreatingColumn}
        isEditing={isEditingColumn}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatingColumn(false);
            setIsEditingColumn(false);
            setEditingColumn(null);
          }
        }}
        title={isCreatingColumn ? newColumnTitle : editingColumnTitle}
        onTitleChange={(title) => {
          if (isCreatingColumn) {
            setNewColumnTitle(title);
          } else {
            setEditingColumnTitle(title);
          }
        }}
        onSubmit={isCreatingColumn ? handleCreateColumn : handleUpdateColumn}
        onCancel={() => {
          setIsCreatingColumn(false);
          setIsEditingColumn(false);
          setNewColumnTitle("");
          setEditingColumnTitle("");
          setEditingColumn(null);
        }}
        loading={loading}
      />
    </>
  );
}
