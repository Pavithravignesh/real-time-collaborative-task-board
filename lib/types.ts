export interface TaskData {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}

export interface FilterData {
  priority: string[];
  assignee: string[];
  dueDate: string | null;
}

export interface BoardFilterData {
  search: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  taskCount: {
    min: number | null;
    max: number | null;
  };
} 