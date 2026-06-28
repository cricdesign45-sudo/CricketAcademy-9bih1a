import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';

function ChatTabIcon({ color, size }: { color: string; size: number }) {
  const { totalUnread } = useChat();
  return (
    <View style={{ width: size + 8, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialIcons name="chat" size={size} color={color} />
      {totalUnread > 0 ? (
        <View style={{
          position: 'absolute', top: -3, right: -3,
          minWidth: 15, height: 15, borderRadius: 8,
          backgroundColor: '#DC2626',
          alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{ fontSize: 9, color: '#fff', fontWeight: '800' }}>
            {totalUnread > 9 ? '9+' : totalUnread}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function PlayerLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { Colors: C } = useTheme();

  if (!user || user.role !== 'player') return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.bgCard,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.select({ ios: insets.bottom + 64, android: 64, default: 72 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: insets.bottom + 8, android: 8, default: 8 }),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="performance" options={{ title: 'Report', tabBarIcon: ({ color, size }) => <MaterialIcons name="assessment" size={size} color={color} /> }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Rankings', tabBarIcon: ({ color, size }) => <MaterialIcons name="emoji-events" size={size} color={color} /> }} />
      <Tabs.Screen name="ai-chat" options={{ title: 'AI Coach', tabBarIcon: ({ color, size }) => <MaterialIcons name="auto-awesome" size={size} color={color} /> }} />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <ChatTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}
