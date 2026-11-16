export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  details: string;
  priority: Priority;
  /** Due date/time as epoch ms, or null when the task has no deadline. */
  dueAt: number | null;
  /** Whether a local notification should fire at `dueAt`. */
  remind: boolean;
  /** Id of the scheduled local notification, if any. */
  notificationId: string | null;
  done: boolean;
  createdAt: number;
  completedAt: number | null;
};

export type NoteKind = 'note' | 'journal';

export type Note = {
  id: string;
  kind: NoteKind;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
};

export const KIND_LABEL: Record<NoteKind, string> = {
  note: 'ملاحظة',
  journal: 'يومية',
};

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
