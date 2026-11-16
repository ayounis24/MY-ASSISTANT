import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Card, Chip, Empty, Fab, Field, Row, Txt } from '../../components/ui';
import { formatDate } from '../../lib/dates';
import { useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { KIND_LABEL, type Note, type NoteKind } from '../../lib/types';

type Filter = 'all' | NoteKind;

export default function NotesScreen() {
  const t = useTheme();
  const { ready, notes } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => filter === 'all' || n.kind === filter)
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [notes, query, filter]);

  if (!ready) return <ActivityIndicator style={{ marginTop: 40 }} color={t.primary} />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={visible}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 6 }}>
            <Field placeholder="🔎 دوّر في ملاحظاتك" value={query} onChangeText={setQuery} />
            <Row style={{ gap: 8 }}>
              <Chip label="الكل" active={filter === 'all'} onPress={() => setFilter('all')} />
              <Chip label="ملاحظات" active={filter === 'note'} onPress={() => setFilter('note')} />
              <Chip label="يوميات" active={filter === 'journal'} onPress={() => setFilter('journal')} />
            </Row>
          </View>
        }
        ListEmptyComponent={
          query ? (
            <Empty emoji="🔍" title="مفيش نتايج" hint={`مالقيناش حاجة فيها "${query}"`} />
          ) : (
            <Empty
              emoji="📓"
              title="لسه مكتبتش حاجة"
              hint="اضغط + واكتب فكرة أو يومية النهارده"
            />
          )
        }
        renderItem={({ item }) => <NoteRow note={item} />}
      />
      <Fab label="ملاحظة جديدة" onPress={() => router.push('/note/new')} />
    </View>
  );
}

function NoteRow({ note }: { note: Note }) {
  const preview = note.body.replace(/\s+/g, ' ').trim();
  return (
    <Pressable onPress={() => router.push(`/note/${note.id}`)}>
      <Card style={{ gap: 6 }}>
        <Row style={{ gap: 8 }}>
          <Txt weight="700" style={{ flex: 1 }} numberOfLines={1}>
            {note.pinned ? '📌 ' : ''}
            {note.title || (note.kind === 'journal' ? `يومية ${formatDate(note.createdAt)}` : 'بدون عنوان')}
          </Txt>
          <Txt size={12} muted>
            {KIND_LABEL[note.kind]} · {formatDate(note.updatedAt)}
          </Txt>
        </Row>
        {!!preview && (
          <Txt muted size={14} numberOfLines={2}>
            {preview}
          </Txt>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10, paddingBottom: 110 },
});
