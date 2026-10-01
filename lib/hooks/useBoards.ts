"use client";

import { useUser } from "@clerk/nextjs";
import {
  boardDataService,
  boardService,
  columnService,
  taskService,
} from "../services";
import { useCallback, useEffect, useRef, useState } from "react";
import { Board, ColumnWithTasks } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !supabase) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await boardService.getBoards(supabase, user.id);
        if (!cancelled) setBoards(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load boards.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user || !supabase) throw new Error("User not authenticated");

    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase,
        {
          ...boardData,
          userId: user.id,
        }
      );
      setBoards((prev) => [newBoard, ...prev]);
      return newBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
    }
  }

  return { boards, loading, error, createBoard };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const { user } = useUser();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const loadBoard = useCallback(
    async (showSpinner = true) => {
      if (!boardId || !supabase) return;

      try {
        if (showSpinner) setLoading(true);
        setError(null);
        const data = await boardDataService.getBoardWithColumns(
          supabase,
          boardId
        );
        setBoard(data.board);
        setColumns(data.columnsWithTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load board.");
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [boardId, supabase]
  );

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Real-time sync: refetch when tasks/columns change in another tab or client.
  // RLS limits the events to rows on boards the user owns.
  useEffect(() => {
    if (!supabase || !boardId) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => loadBoard(false), 300);
    };

    const channel = supabase
      .channel(`board-${boardId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, refresh)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${boardId}`,
        },
        refresh
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [supabase, boardId, loadBoard]);

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    if (!supabase) return;
    try {
      const updatedBoard = await boardService.updateBoard(
        supabase,
        boardId,
        updates
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update the board."
      );
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
    }
  ) {
    if (!supabase) return;
    try {
      const newTask = await taskService.createTask(supabase, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order:
          columns.find((col) => col.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || "medium",
      });

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
        )
      );

      return newTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the task."
      );
    }
  }

  /**
   * Move a task into `newColumnId`. If `overTaskId` is given the task takes
   * that task's position, otherwise it is appended to the end of the column.
   * Every task whose column or position changed is persisted.
   */
  async function moveTask(
    taskId: string,
    newColumnId: string,
    overTaskId: string | null
  ) {
    if (!supabase) return;

    const prev = columnsRef.current;
    const sourceColumn = prev.find((col) =>
      col.tasks.some((task) => task.id === taskId)
    );
    const targetColumn = prev.find((col) => col.id === newColumnId);
    if (!sourceColumn || !targetColumn) return;

    const taskToMove = sourceColumn.tasks.find((task) => task.id === taskId)!;
    const overIndex =
      overTaskId === null
        ? -1
        : targetColumn.tasks.findIndex((task) => task.id === overTaskId);

    const next = prev.map((col) => {
      let tasks = col.tasks.filter((task) => task.id !== taskId);
      if (col.id === newColumnId) {
        const insertAt = overIndex === -1 ? tasks.length : overIndex;
        tasks = [
          ...tasks.slice(0, insertAt),
          { ...taskToMove, column_id: newColumnId },
          ...tasks.slice(insertAt),
        ];
      }
      return {
        ...col,
        tasks: tasks.map((task, index) => ({ ...task, sort_order: index })),
      };
    });

    const before = new Map(
      prev.flatMap((col) => col.tasks).map((task) => [task.id, task])
    );
    const changed = next
      .flatMap((col) => col.tasks)
      .filter((task) => {
        const old = before.get(task.id);
        return (
          !old ||
          old.column_id !== task.column_id ||
          old.sort_order !== task.sort_order
        );
      });

    if (changed.length === 0) return;

    setColumns(next);

    try {
      await taskService.updateTaskPositions(
        supabase,
        changed.map((task) => ({
          id: task.id,
          column_id: task.column_id,
          sort_order: task.sort_order,
        }))
      );
    } catch (err) {
      setColumns(prev);
      setError(err instanceof Error ? err.message : "Failed to move task.");
    }
  }

  async function createColumn(title: string) {
    if (loading) {
      throw new Error("Board is still loading");
    }

    if (!board || !user || !supabase) {
      throw new Error("Board not loaded");
    }

    try {
      const newColumn = await columnService.createColumn(supabase, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: user.id,
      });

      setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
      return newColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
      throw err; // Re-throw to handle in the calling component
    }
  }

  async function updateColumn(columnId: string, title: string) {
    if (!supabase) return;
    try {
      const updatedColumn = await columnService.updateColumnTitle(
        supabase,
        columnId,
        title
      );

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, ...updatedColumn } : col
        )
      );

      return updatedColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update column.");
    }
  }

  return {
    board,
    columns,
    loading,
    error,
    updateBoard,
    createRealTask,
    moveTask,
    createColumn,
    updateColumn,
  };
}
