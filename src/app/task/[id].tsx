import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Button, Chip, DateTimeField, Field, Row, Txt } from '../../components/ui';
import { useStore } from '../../lib/store';
import { PRIORITY_COLOR, useTheme } from '../../lib/theme';
import { newId, PRIORITY_LABEL, type Priority, type Task } from '../../lib/types';

function defaultDue(): number {
  // Next full hour from now.
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.getTime();
}

export default function TaskScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, ready } = useStore();

  // Wait for storage so a deep link from a reminder finds its task.
  if (!ready) return <ActivityIndicator style={{ marginTop: 40 }} color={t.primary} />;

  const existing = tasks.find((x) => x.id === id);
  if (id !== 'new' && !existing) {
    return (
      <View style={styles.container}>
        <Txt>المهمة دي اتمسحت.</Txt>
      </View>
    );
  }
  return <TaskEditor existing={existing} />;
}

function TaskEditor({ existing }: { existing?: Task }) {
  const t = useTheme();
  const { saveTask, deleteTask } = useStore();
  const isNew = !existing;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [details, setDetails] = useState(existing?.details ?? '');
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'medium');
  const [hasDue, setHasDue] = useState(existing ? existing.dueAt !== null : false);
  const [dueAt, setDueAt] = useState(existing?.dueAt ?? defaultDue());
  const [remind, setRemind] = useState(existing?.remind ?? true);

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('اكتب عنوان المهمة الأول');
      return;
    }
    const task: Task = {
      id: existing?.id ?? newId(),
      title: title.trim(),
      details: details.trim(),
      priority,
      dueAt: hasDue ? dueAt : null,
      remind: hasDue && remind,
      notificationId: existing?.notificationId ?? null,
      done: existing?.done ?? false,
      createdAt: existing?.createdAt ?? Date.now(),
      completedAt: existing?.completedAt ?? null,
    };
    const saved = await saveTask(task);
    if (saved.remind && !saved.done && !saved.notificationId) {
      Alert.alert(
        'التذكير مش هيشتغل',
        saved.dueAt! <= Date.now()
          ? 'الميعاد اللي اخترته فات خلاص.'
          : 'لازم تسمح للتطبيق بالإشعارات من إعدادات الموبايل.',
      );
    }
    router.back();
  };

  const onDelete = () => {
    Alert.alert('مسح المهمة؟', 'مش هتقدر ترجعها تاني.', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'امسح',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(existing!.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: isNew ? 'مهمة جديدة' : 'تعديل المهمة' }} />

      <Field
        placeholder="هتعمل إيه؟"
        value={title}
        onChangeText={setTitle}
        autoFocus={isNew}
        returnKeyType="done"
      />
      <Field placeholder="تفاصيل (اختياري)" value={details} onChangeText={setDetails} multiline />

      <Txt weight="600">الأولوية</Txt>
      <Row style={{ gap: 8 }}>
        {(['high', 'medium', 'low'] as Priority[]).map((p) => (
          <Chip
            key={p}
            label={PRIORITY_LABEL[p]}
            active={priority === p}
            color={PRIORITY_COLOR[p]}
            onPress={() => setPriority(p)}
          />
        ))}
      </Row>

      <Row style={styles.switchRow}>
        <Txt weight="600" style={{ flex: 1 }}>
          ليها ميعاد
        </Txt>
        <Switch value={hasDue} onValueChange={setHasDue} trackColor={{ true: t.primary }} />
      </Row>

      {hasDue && (
        <>
          <DateTimeField value={dueAt} onChange={setDueAt} />
          <Row style={styles.switchRow}>
            <Txt weight="600" style={{ flex: 1 }}>
              فكّرني بإشعار
            </Txt>
            <Switch value={remind} onValueChange={setRemind} trackColor={{ true: t.primary }} />
          </Row>
        </>
      )}

      <View style={{ gap: 10, marginTop: 12 }}>
        <Button label="حفظ" onPress={onSave} />
        {!isNew && <Button label="مسح المهمة" variant="danger" onPress={onDelete} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  switchRow: { gap: 12, paddingVertical: 4 },
});
