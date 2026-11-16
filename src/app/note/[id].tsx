import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Field, Row, Txt } from '../../components/ui';
import { formatLongDate } from '../../lib/dates';
import { useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { newId, type Note, type NoteKind } from '../../lib/types';

export default function NoteScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, notes } = useStore();

  if (!ready) return <ActivityIndicator style={{ marginTop: 40 }} color={t.primary} />;

  const existing = notes.find((n) => n.id === id);
  if (id !== 'new' && !existing) {
    return (
      <View style={styles.container}>
        <Txt>الملاحظة دي اتمسحت.</Txt>
      </View>
    );
  }
  return <NoteEditor existing={existing} />;
}

/** Edits a note and autosaves on every change; empty new notes are never stored. */
function NoteEditor({ existing }: { existing?: Note }) {
  const t = useTheme();
  const { saveNote, deleteNote } = useStore();
  const idRef = useRef(existing?.id ?? newId());
  const createdAt = useRef(existing?.createdAt ?? Date.now());

  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [kind, setKind] = useState<NoteKind>(existing?.kind ?? 'note');
  const [pinned, setPinned] = useState(existing?.pinned ?? false);
  const deleted = useRef(false);
  const first = useRef(true);
  const savedOnce = useRef(!!existing);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (deleted.current) return;
    if (!title.trim() && !body.trim()) {
      // Don't keep blank notes around.
      if (savedOnce.current) deleteNote(idRef.current);
      savedOnce.current = false;
      return;
    }
    savedOnce.current = true;
    saveNote({
      id: idRef.current,
      kind,
      title,
      body,
      pinned,
      createdAt: createdAt.current,
      updatedAt: Date.now(),
    });
  }, [title, body, kind, pinned, saveNote, deleteNote]);

  const onDelete = () => {
    Alert.alert('مسح الملاحظة؟', 'مش هتقدر ترجعها تاني.', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'امسح',
        style: 'destructive',
        onPress: () => {
          deleted.current = true;
          deleteNote(idRef.current);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: existing ? 'تعديل' : 'جديد',
          headerRight: () => (
            <Row style={{ gap: 18 }}>
              <Pressable onPress={() => setPinned((p) => !p)} hitSlop={8} accessibilityLabel="تثبيت">
                <Txt style={{ opacity: pinned ? 1 : 0.35 }}>📌</Txt>
              </Pressable>
              {existing && (
                <Pressable onPress={onDelete} hitSlop={8} accessibilityLabel="مسح">
                  <Txt>🗑️</Txt>
                </Pressable>
              )}
            </Row>
          ),
        }}
      />

      <Row style={{ gap: 8 }}>
        <Chip label="ملاحظة" active={kind === 'note'} onPress={() => setKind('note')} />
        <Chip label="يومية" active={kind === 'journal'} onPress={() => setKind('journal')} />
      </Row>
      <Txt muted size={13}>
        {formatLongDate(createdAt.current)}
      </Txt>

      <Field
        placeholder={kind === 'journal' ? 'عنوان اليوم (اختياري)' : 'العنوان'}
        value={title}
        onChangeText={setTitle}
        style={{ fontSize: 20, fontWeight: '700' }}
      />
      <Field
        placeholder={kind === 'journal' ? 'يومك كان عامل إزاي؟' : 'اكتب هنا...'}
        value={body}
        onChangeText={setBody}
        multiline
        autoFocus={!existing}
        style={{ minHeight: 280, lineHeight: 26 }}
      />
      <Txt muted size={12} style={{ color: t.muted }}>
        بيتحفظ تلقائي ✓
      </Txt>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
});
