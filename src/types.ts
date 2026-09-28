export type Priority = 'High' | 'Medium' | 'Low';

export type ColumnId = 'backlog' | 'in-progress' | 'in-review' | 'done' | 'blocked';

export interface CardData {
  id: string;
  title: string;
  assignee: string;
  priority: Priority;
  dueDate: string;
  columnId: ColumnId;
}

export interface ColumnDef {
  id: ColumnId;
  label: string;
  tint?: 'red';
}

export const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export const COLUMNS: ColumnDef[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'in-review', label: 'In Review' },
  { id: 'done', label: 'Done' },
  { id: 'blocked', label: 'Blocked', tint: 'red' },
];

export const DRAG_TYPE = 'CARD';
