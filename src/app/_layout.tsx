import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StoreProvider } from '../lib/store';
import { useTheme } from '../lib/theme';

function useOpenTaskFromNotification() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const open = (response: Notifications.NotificationResponse | null) => {
      const taskId = response?.notification.request.content.data?.taskId;
      if (typeof taskId === 'string') router.push(`/task/${taskId}`);
    };
    // App opened by tapping a reminder while it was closed.
    Notifications.getLastNotificationResponseAsync().then(open);
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  const t = useTheme();
  useOpenTaskFromNotification();
  return (
    <StoreProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.card },
          headerTintColor: t.text,
          headerTitleAlign: 'center',
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="task/[id]" options={{ title: 'مهمة', presentation: 'modal' }} />
        <Stack.Screen name="note/[id]" options={{ title: 'ملاحظة' }} />
      </Stack>
    </StoreProvider>
  );
}
