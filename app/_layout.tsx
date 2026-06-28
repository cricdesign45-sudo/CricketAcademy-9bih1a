import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { PlayersProvider } from '@/contexts/PlayersContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppConfigProvider } from '@/contexts/AppConfigContext';
import { ChatProvider } from '@/contexts/ChatContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppConfigProvider>
          <ThemeProvider>
            <AuthProvider>
              <PlayersProvider>
                <NotificationProvider>
                  <ChatProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="register" />
                    <Stack.Screen name="maintenance" />
                    <Stack.Screen name="(admin)" />
                    <Stack.Screen name="(player)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="player-detail" options={{ headerShown: true, title: 'Player Profile', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: '#111827', headerShadowVisible: false }} />
                    <Stack.Screen name="add-player" options={{ headerShown: true, title: 'Add Player', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: '#111827', headerShadowVisible: false }} />
                    <Stack.Screen name="add-points" options={{ headerShown: true, title: 'Manage Points', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: '#111827', headerShadowVisible: false }} />
                    <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: '#111827', headerShadowVisible: false }} />
                    <Stack.Screen name="feedback" options={{ headerShown: true, title: 'Player Feedback', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: '#111827', headerShadowVisible: false }} />
                    <Stack.Screen name="hall-of-fame" options={{ headerShown: true, title: 'Hall of Fame', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: '#111827', headerShadowVisible: false }} />
                    <Stack.Screen name="certificate" options={{ headerShown: true, title: 'Certificates', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: '#111827', headerShadowVisible: false }} />
                    <Stack.Screen name="player-id-card" options={{ headerShown: true, title: 'Player ID Cards', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: '#111827', headerShadowVisible: false }} />
                    <Stack.Screen name="chat-conversation" options={{ headerShown: false }} />
                  </Stack>
                  </ChatProvider>
                </NotificationProvider>
              </PlayersProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppConfigProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
