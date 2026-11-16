import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Card, Chip, Empty, Fab, Row, Txt } from '../../components/ui';
import { formatDue, formatLongDate, isToday } from '../../lib/dates';
import { useStore } from '../../lib/store';
import { PRIORITY_COLOR, useTheme } from '../../lib/theme';
import { PRIORITY_LABEL, type Priority, type Task } from '../../lib/types';

type Filter = 'today' | 'all' | 'overdue' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'today', label: 'اليوم' },
  { key: 'all', label: 'كل المهام' },
  { key: 'overdue', label: 'متأخرة' },
  { key: 'done', label: 'مكتملة' },
];

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function isOverdue(t: Task): boolean {
  return !t.done && t.dueAt !== null && t.dueAt < Date.now();
}

function sortOpen(a: Task, b: Task): number {
  // Tasks with a due date first (earliest first), then by priority, then newest.
  const ad = a.dueAt ?? Infinity;
  const bd = b.dueAt ?? Infinity;
  if (ad !== bd) return ad - bd;
  if (a.priority !== b.priority) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  return b.createdAt - a.createdAt;
}

export default function TasksScreen() {
  const t = useTheme();
  const { ready, tasks, toggleTask } = useStore();
  const [filter, setFilter] = useState<Filter>('today');

  const visible = useMemo(() => {
    switch (filter) {
      case 'today':
        // Due today, overdue, or undated open tasks — what needs attention now.
        return tasks
          .filter((x) => !x.done && (x.dueAt === null || isToday(x.dueAt) || isOverdue(x)))
          .sort(sortOpen);
      case 'all':
        return tasks.filter((x) => !x.done).sort(sortOpen);
      case 'overdue':
        return tasks.filter(isOverdue).sort(sortOpen);
      case 'done':
        return tasks
          .filter((x) => x.done)
          .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
    }
  }, [tasks, filter]);

  const openCount = tasks.filter((x) => !x.done).length;
  const doneToday = tasks.filter((x) => x.done && x.completedAt && isToday(x.completedAt)).length;

  if (!ready) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={t.primary} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={visible}
        keyExtractor={(x) => x.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 6 }}>
            <View>
              <Txt muted size={14}>
                {formatLongDate(Date.now())}
              </Txt>
              <Txt size={22} weight="700">
                {openCount === 0
                  ? 'مفيش مهام مفتوحة 🎉'
                  : `عندك ${openCount} مهمة مفتوحة`}
              </Txt>
              {doneToday > 0 && (
                <Txt muted size={14}>
                  خلّصت {doneToday} النهارده — عاش!
                </Txt>
              )}
            </View>
            <Row style={{ gap: 8, flexWrap: 'wrap' }}>
              {FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  active={filter === f.key}
                  onPress={() => setFilter(f.key)}
                />
              ))}
            </Row>
          </View>
        }
        ListEmptyComponent={
          <Empty
            emoji={filter === 'done' ? '📭' : '🌤️'}
            title={filter === 'done' ? 'لسه مفيش مهام مكتملة' : 'مفيش حاجة هنا'}
            hint="اضغط + عشان تضيف مهمة جديدة"
          />
        }
        renderItem={({ item }) => (
          <TaskRow task={item} onToggle={() => toggleTask(item.id)} />
        )}
      />
      <Fab label="مهمة جديدة" onPress={() => router.push('/task/new')} />
    </View>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const t = useTheme();
  const overdue = isOverdue(task);
  return (
    <Pressable onPress={() => router.push(`/task/${task.id}`)}>
      <Card style={{ borderRightWidth: 4, borderRightColor: PRIORITY_COLOR[task.priority] }}>
        <Row style={{ gap: 12 }}>
          <Pressable
            onPress={onToggle}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.done }}
            style={[
              styles.check,
              { borderColor: task.done ? t.success : t.muted },
              task.done && { backgroundColor: t.success },
            ]}
          >
            {task.done && <Txt style={{ color: '#fff', textAlign: 'center' }}>✓</Txt>}
          </Pressable>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt
              weight="600"
              style={task.done && { textDecorationLine: 'line-through', color: t.muted }}
            >
              {task.title}
            </Txt>
            <Row style={{ gap: 10, flexWrap: 'wrap' }}>
              {task.dueAt !== null && (
                <Txt size={13} style={{ color: overdue ? t.danger : t.muted }}>
                  {task.remind ? '⏰' : '📅'} {formatDue(task.dueAt)}
                  {overdue ? ' · متأخرة' : ''}
                </Txt>
              )}
              <Txt size={13} muted>
                أولوية {PRIORITY_LABEL[task.priority]}
              </Txt>
            </Row>
          </View>
        </Row>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10, paddingBottom: 110 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
