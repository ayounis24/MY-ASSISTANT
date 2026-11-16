import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cancelReminder, scheduleReminder } from './notifications';
import type { Note, Task } from './types';

const TASKS_KEY = 'my-assistant/tasks/v1';
const NOTES_KEY = 'my-assistant/notes/v1';

type Store = {
  ready: boolean;
  tasks: Task[];
  notes: Note[];
  /** Create or update a task; (re)schedules its reminder. Returns the saved task. */
  saveTask: (task: Task) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  saveNote: (note: Note) => void;
  deleteNote: (id: string) => void;
};

const StoreContext = createContext<Store | null>(null);

async function load<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  // Refs let async actions read the latest state without stale closures.
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    Promise.all([load<Task>(TASKS_KEY), load<Note>(NOTES_KEY)]).then(([t, n]) => {
      setTasks(t);
      setNotes(n);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks)).catch(() => {});
  }, [tasks, ready]);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes)).catch(() => {});
  }, [notes, ready]);

  const upsertTask = useCallback((task: Task) => {
    setTasks((prev) => {
      const i = prev.findIndex((t) => t.id === task.id);
      if (i === -1) return [task, ...prev];
      const next = prev.slice();
      next[i] = task;
      return next;
    });
  }, []);

  const saveTask = useCallback(
    async (task: Task) => {
      const previous = tasksRef.current.find((t) => t.id === task.id);
      await cancelReminder(previous?.notificationId ?? null);
      let notificationId: string | null = null;
      if (task.remind && task.dueAt && !task.done) {
        notificationId = await scheduleReminder(task.id, task.title, task.details, task.dueAt);
      }
      const saved = { ...task, notificationId };
      upsertTask(saved);
      return saved;
    },
    [upsertTask],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasksRef.current.find((t) => t.id === id);
      if (!task) return;
      const done = !task.done;
      await saveTask({ ...task, done, completedAt: done ? Date.now() : null });
    },
    [saveTask],
  );

  const deleteTask = useCallback(async (id: string) => {
    const task = tasksRef.current.find((t) => t.id === id);
    await cancelReminder(task?.notificationId ?? null);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const saveNote = useCallback((note: Note) => {
    setNotes((prev) => {
      const i = prev.findIndex((n) => n.id === note.id);
      if (i === -1) return [note, ...prev];
      const next = prev.slice();
      next[i] = note;
      return next;
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = useMemo<Store>(
    () => ({ ready, tasks, notes, saveTask, toggleTask, deleteTask, saveNote, deleteNote }),
    [ready, tasks, notes, saveTask, toggleTask, deleteTask, saveNote, deleteNote],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
